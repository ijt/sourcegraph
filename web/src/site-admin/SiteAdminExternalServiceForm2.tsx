import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import * as H from 'history'
import { upperFirst } from 'lodash'
import * as React from 'react'
import * as GQL from '../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../shared/src/util/errors'
import { Form } from '../components/Form'
import { DynamicallyImportedMonacoSettingsEditor } from '../settings/DynamicallyImportedMonacoSettingsEditor'
import { ExternalServiceMetadata } from './externalServices'

interface Props {
    history: H.History
    externalService: ExternalServiceMetadata
    isLightTheme: boolean
    error?: ErrorLike
    mode: 'edit' | 'create'
    loading: boolean
    onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
    onChange: (change: GQL.IAddExternalServiceInput) => void
}

export class SiteAdminExternalServiceForm extends React.Component<Props, {}> {
    public render(): JSX.Element | null {
        return (
            <Form className="external-service-form" onSubmit={this.props.onSubmit}>
                {this.props.error && <p className="alert alert-danger">{upperFirst(this.props.error.message)}</p>}
                <div className="form-group">
                    <label htmlFor="e2e-external-service-form-display-name">Display name</label>
                    <input
                        id="e2e-external-service-form-display-name"
                        type="text"
                        className="form-control"
                        required={true}
                        autoCorrect="off"
                        autoComplete="off"
                        autoFocus={true}
                        spellCheck={false}
                        value={this.props.externalService.defaultDisplayName}
                        onChange={this.onDisplayNameChange}
                        disabled={this.props.loading}
                    />
                </div>
                <div className="form-group">
                    <label className="external-services-form__quick-configure-label">Quick configure:</label>
                    <p>
                        <button className="btn btn-secondary btn-sm external-services-form__quick-configure-button">
                            Set access token
                        </button>
                        <button className="btn btn-secondary btn-sm external-services-form__quick-configure-button">
                            Add specific repository
                        </button>
                        <button className="btn btn-secondary btn-sm external-services-form__quick-configure-button">
                            Add organization repositories
                        </button>
                        <button className="btn btn-secondary btn-sm external-services-form__quick-configure-button">
                            Add repositories matching GitHub search query
                        </button>
                    </p>
                    <DynamicallyImportedMonacoSettingsEditor
                        // DynamicallyImportedMonacoSettingsEditor does not re-render the passed input.config
                        // if it thinks the config is dirty. We want to always replace the config if the kind changes
                        // so the editor is keyed on the kind.
                        value={this.props.externalService.defaultConfig}
                        jsonSchema={this.props.externalService.jsonSchema}
                        canEdit={false}
                        loading={this.props.loading}
                        height={300}
                        isLightTheme={this.props.isLightTheme}
                        onChange={this.onConfigChange}
                        history={this.props.history}
                    />
                    <p className="form-text text-muted">
                        <small>Use Ctrl+Space for completion, and hover over JSON properties for documentation.</small>
                    </p>
                </div>
                <button
                    type="submit"
                    className={`btn btn-primary ${this.props.mode === 'create' && 'e2e-add-external-service-button'}`}
                    disabled={this.props.loading}
                >
                    {this.props.loading && <LoadingSpinner className="icon-inline" />}
                    {this.props.mode === 'edit'
                        ? `Update ${this.props.externalService.title}`
                        : `Add ${this.props.externalService.title}`}
                </button>
            </Form>
        )
    }

    private onDisplayNameChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        // this.props.onChange({ ...this.props.input, displayName: event.currentTarget.value })
    }

    private onConfigChange = (config: string) => {
        // this.props.onChange({ ...this.props.input, config })
    }
}
