import * as H from 'history'
import React from 'react'
import { noop } from 'rxjs'
import { LinkOrButton } from '../../../shared/src/components/LinkOrButton'
import { ExternalServiceKind } from '../../../shared/src/graphql/schema'
import * as GQL from '../../../shared/src/graphql/schema'
import { PageTitle } from '../components/PageTitle'
import { ThemeProps } from '../theme'
import { getExternalService } from './externalServices'
import { SiteAdminExternalServiceForm } from './SiteAdminExternalServiceForm2'
import GithubCircleIcon from 'mdi-react/GithubCircleIcon'

interface SiteAdminAddExternalServiceProps extends ThemeProps {
    history: H.History
    kind: ExternalServiceKind
}

interface SiteAdminAddExternalServiceState {}

export class SiteAdminAddExternalServicePage extends React.Component<
    SiteAdminAddExternalServiceProps,
    SiteAdminAddExternalServiceState
> {
    public render(): JSX.Element | null {
        const externalService = getExternalService(this.props.kind)
        return (
            <div className="add-external-service-page">
                <PageTitle title={externalService.title} />
                <h1>Add {externalService.title}</h1>
                {externalService.longDescription ? (
                    <div className="alert alert-info">{externalService.longDescription}</div>
                ) : (
                    undefined
                )}
                <SiteAdminExternalServiceForm
                    // error={this.state.error}
                    externalService={getExternalService(this.props.kind)}
                    {...this.props}
                    mode="create"
                    loading={false}
                    onSubmit={noop}
                    onChange={noop}
                    // loading={this.state.loading}
                    // onSubmit={this.onSubmit}
                    // onChange={this.onChange}
                />
            </div>
        )
    }
}

interface SiteAdminAddExternalServicesProps extends ThemeProps {
    history: H.History
    eventLogger: {
        logViewEvent: (event: 'AddExternalService') => void
        log: (event: 'AddExternalServiceFailed' | 'AddExternalServiceSucceeded', eventProperties?: any) => void
    }
}

interface SiteAdminAddExternalServicesState {}

interface ButtonProps {
    kind: ExternalServiceKind
    text: string
    secondaryKind?: string // TODO(beyang): e.g., github.com vs GH Enterprise, populate with different default config
}

export class SiteAdminAddExternalServicesPage extends React.Component<
    SiteAdminAddExternalServicesProps,
    SiteAdminAddExternalServicesState
> {
    private getExternalServiceKind(): GQL.ExternalServiceKind | null {
        const params = new URLSearchParams(this.props.history.location.search)
        let kind = params.get('kind') || undefined
        if (kind) {
            kind = kind.toUpperCase()
        }
        const isKnownKind = (kind: string): kind is GQL.ExternalServiceKind =>
            !!getExternalService(kind as GQL.ExternalServiceKind)
        return kind && isKnownKind(kind) ? kind : null
    }

    public render(): JSX.Element | null {
        const kind = this.getExternalServiceKind()
        if (kind) {
            return <SiteAdminAddExternalServicePage {...this.props} kind={kind} />
        } else {
            const buttons: ButtonProps[] = [
                {
                    kind: ExternalServiceKind.AWSCODECOMMIT,
                    text: 'Add repositories from AWS CodeCommit',
                },
                {
                    kind: ExternalServiceKind.GITHUB,
                    text: 'Add repositories from GitHub Enterprise',
                },
                {
                    kind: ExternalServiceKind.GITHUB,
                    text: 'Add repositories from GitHub.com',
                },
                {
                    kind: ExternalServiceKind.GITLAB,
                    text: 'Add projects from GitLab',
                },
                {
                    kind: ExternalServiceKind.BITBUCKETSERVER,
                    text: 'Add repositories from Bitbucket Server',
                },
                {
                    kind: ExternalServiceKind.GITOLITE,
                    text: 'Add repositories from Gitolite',
                },
                {
                    kind: ExternalServiceKind.OTHER,
                    text: 'Add repositories by Git clone URL',
                },
                {
                    kind: ExternalServiceKind.PHABRICATOR,
                    text: 'Link with Phabricator',
                },
            ]
            return (
                <div className="add-external-services-page">
                    <PageTitle title="Choose an external service type to add" />
                    <h1>Add external service</h1>
                    <p>Choose an external service to add to Sourcegraph.</p>
                    {buttons.map((button, i) => (
                        // <LinkOrButton key={i} to={`?kind=${button.kind.toLowerCase()}`}>
                        //     <button className="btn btn-primary e2e-add-external-service-button add-external-services-page__button">
                        //         {button.text}
                        //     </button>
                        // </LinkOrButton>
                        <div className="external-service-button">
                            <div className="external-service-button__logo">
                                <GithubCircleIcon size={50} className="external-services-button__logo-icon" />
                            </div>
                            <div className="external-service-button__main">
                                <h2 className="external-service-button__main-header">GitHub</h2>
                                <p className="external-service-button__main-body">
                                    Add GitHub.com repositories to Sourcegraph.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    }
}

export const PhabricatorIcon: React.FunctionComponent<void> = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        height="120"
        width="120"
        viewBox="-147 -147 294 294"
    >
        <g id="a">
            <g id="b">
                <g id="c">
                    <path id="e" d="m7.2-47-1.2-21h-12l-1.236 21" />
                    <use xlinkHref="#e" transform="scale(1,-1)" />
                </g>
                <use xlinkHref="#c" transform="rotate(90)" />
            </g>
            <use xlinkHref="#b" transform="rotate(45)" />
        </g>
        <use xlinkHref="#a" transform="rotate(22.5)" />
        <circle r="23" />
        <g fill="none" stroke="#000">
            <path
                stroke-width="14"
                d="m0 87c-66 0-117-54-138.5-87 21.5-33 72.5-87 138.5-87s117 54 138.5 87c-21.5 33-72.5 87-138.5 87z"
            />
            <circle r="47.5" stroke-width="19" />
        </g>
    </svg>
)
