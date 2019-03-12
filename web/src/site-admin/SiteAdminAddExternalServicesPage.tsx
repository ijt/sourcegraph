import * as H from 'history'
import { map } from 'lodash'
import React from 'react'
import { noop } from 'rxjs'
import { LinkOrButton } from '../../../shared/src/components/LinkOrButton'
import * as GQL from '../../../shared/src/graphql/schema'
import { ExternalServiceKind } from '../../../shared/src/graphql/schema'
import { PageTitle } from '../components/PageTitle'
import { ThemeProps } from '../theme'
import { AddExternalServiceMetadata, ALL_ADD_EXTERNAL_SERVICES, getExternalService } from './externalServices'
import { SiteAdminExternalServiceForm } from './SiteAdminExternalServiceForm2'
import { flatMap } from 'rxjs/operators'
import { ExternalServiceButton } from './ExternalServiceButton'

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

    private static addServiceURL(addService: AddExternalServiceMetadata): string {
        const components: { [key: string]: string } = {
            kind: encodeURIComponent(addService.serviceKind.toLowerCase()),
        }
        if (addService.qualifier) {
            components.qualifier = encodeURIComponent(addService.qualifier)
        }
        return '?' + map(components, (v, k) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    }

    public render(): JSX.Element | null {
        const kind = this.getExternalServiceKind()
        if (kind) {
            return <SiteAdminAddExternalServicePage {...this.props} kind={kind} />
        } else {
            const addExternalServices = ALL_ADD_EXTERNAL_SERVICES
            return (
                <div className="add-external-services-page">
                    <PageTitle title="Choose an external service type to add" />
                    <h1>Add external service</h1>
                    <p>Choose an external service to add to Sourcegraph.</p>
                    {addExternalServices.map((addService, i) => (
                        <LinkOrButton key={i} to={SiteAdminAddExternalServicesPage.addServiceURL(addService)}>
                            <ExternalServiceButton {...addService} />
                        </LinkOrButton>
                    ))}
                </div>
            )
        }
    }
}
