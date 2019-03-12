import React from 'react'
import { ExternalServiceMetadata } from './externalServices'

interface Props extends ExternalServiceMetadata {}
interface State {}

export class ExternalServiceButton extends React.Component<Props, State> {
    public render(): JSX.Element | null {
        const addService: ExternalServiceMetadata = this.props
        return (
            <div className="external-service-button">
                <div
                    className="external-service-button__logo"
                    style={{
                        borderLeft: `2px solid ${addService.color}`,
                    }}
                >
                    {addService.icon}
                </div>
                <div className="external-service-button__main">
                    <h2 className="external-service-button__main-header">{addService.title || addService.title}</h2>
                    <p className="external-service-button__main-body">
                        {addService.shortDescription || addService.shortDescription}
                    </p>
                </div>
            </div>
        )
    }
}
