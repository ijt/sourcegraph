import { isEqual } from 'lodash'
import AddIcon from 'mdi-react/AddIcon'
import DeleteIcon from 'mdi-react/DeleteIcon'
import RadioactiveIcon from 'mdi-react/RadioactiveIcon'
import SettingsIcon from 'mdi-react/SettingsIcon'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { merge, of, Subject, Subscription } from 'rxjs'
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import * as GQL from '../../../shared/src/graphql/schema'
import { asError } from '../../../shared/src/util/errors'
import { CopyableText } from '../components/CopyableText'
import { FilteredConnection } from '../components/FilteredConnection'
import { PageTitle } from '../components/PageTitle'
import { eventLogger } from '../tracking/eventLogger'
import { userURL } from '../user'
import { setUserEmailVerified } from '../user/account/backend'
import { deleteUser, fetchAllUsers, randomizeUserPassword, setUserIsSiteAdmin } from './backend'

interface UserNodeProps {
    /**
     * The user to display in this list item.
     */
    node: GQL.IUser

    /**
     * The currently authenticated user.
     */
    authenticatedUser: GQL.IUser

    /**
     * Called when the user is updated by an action in this list item.
     */
    onDidUpdate?: () => void
}

interface UserNodeState {
    loading: boolean
    errorDescription?: string
    resetPasswordURL?: string | null
}

const nukeDetails = `
- By deleting a user, the user and ALL associated data is marked as deleted in the DB and never served again. You could undo this by running DB commands manually.
- By nuking a user, the user and ALL associated data is deleted forever (you CANNOT undo this). When deleting data at a user's request, nuking is used.

Beware this includes e.g. deleting extensions authored by the user, deleting ANY settings authored or updated by the user, etc.

For more information about what data is deleted, see https://github.com/sourcegraph/sourcegraph/blob/master/doc/admin/user_data_deletion.md

Are you ABSOLUTELY certain you wish to delete this user and all associated data?`

class UserNode extends React.PureComponent<UserNodeProps, UserNodeState> {
    public state: UserNodeState = {
        loading: false,
    }

    private emailVerificationClicks = new Subject<{ email: string; verified: boolean }>()
    private subscriptions = new Subscription()

    public componentDidMount(): void {
        this.subscriptions.add(
            this.emailVerificationClicks
                .pipe(
                    distinctUntilChanged((a, b) => isEqual(a, b)),
                    switchMap(({ email, verified }) =>
                        merge(
                            of({
                                errorDescription: undefined,
                                resetPasswordURL: undefined,
                                loading: true,
                            }),
                            setUserEmailVerified(this.props.node.id, email, verified).pipe(
                                map(() => ({ loading: false })),
                                catchError(error => [{ loading: false, errorDescription: asError(error).message }])
                            )
                        )
                    )
                )
                .subscribe(
                    stateUpdate => {
                        this.setState(stateUpdate)
                        if (this.props.onDidUpdate) {
                            this.props.onDidUpdate()
                        }
                    },
                    err => console.error(err)
                )
        )
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        return (
            <li className="list-group-item py-2">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <Link to={`/users/${this.props.node.username}`}>
                            <strong>{this.props.node.username}</strong>
                        </Link>
                        <br />
                        <span className="text-muted">{this.props.node.displayName}</span>
                    </div>
                    <div>
                        <Link className="btn btn-sm btn-secondary" to={`${userURL(this.props.node.username)}/settings`}>
                            <SettingsIcon className="icon-inline" /> Settings
                        </Link>{' '}
                        {window.context.resetPasswordEnabled && (
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={this.randomizePassword}
                                disabled={this.state.loading || !!this.state.resetPasswordURL}
                            >
                                Reset password
                            </button>
                        )}{' '}
                        {this.props.node.id !== this.props.authenticatedUser.id &&
                            (this.props.node.siteAdmin ? (
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={this.demoteFromSiteAdmin}
                                    disabled={this.state.loading}
                                >
                                    Revoke site admin
                                </button>
                            ) : (
                                <button
                                    key="promote"
                                    className="btn btn-sm btn-secondary"
                                    onClick={this.promoteToSiteAdmin}
                                    disabled={this.state.loading}
                                >
                                    Promote to site admin
                                </button>
                            ))}{' '}
                        {this.props.node.id !== this.props.authenticatedUser.id && (
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={this.deleteUser}
                                disabled={this.state.loading}
                                data-tooltip="Delete user"
                            >
                                <DeleteIcon className="icon-inline" />
                            </button>
                        )}
                        {this.props.node.id !== this.props.authenticatedUser.id && (
                            <button
                                className="ml-1 btn btn-sm btn-danger"
                                onClick={this.nukeUser}
                                disabled={this.state.loading}
                                data-tooltip="Nuke user (click for more information)"
                            >
                                <RadioactiveIcon className="icon-inline" />
                            </button>
                        )}
                    </div>
                </div>
                {this.state.errorDescription && (
                    <div className="alert alert-danger mt-2">{this.state.errorDescription}</div>
                )}
                {this.state.resetPasswordURL && (
                    <div className="alert alert-success mt-2">
                        <p>
                            Password was reset. You must manually send <strong>{this.props.node.username}</strong> this
                            reset link:
                        </p>
                        <CopyableText text={this.state.resetPasswordURL} size={40} />
                    </div>
                )}
            </li>
        )
    }

    private promoteToSiteAdmin = () => this.setSiteAdmin(true)
    private demoteFromSiteAdmin = () => this.setSiteAdmin(false)

    private setSiteAdmin(siteAdmin: boolean): void {
        if (
            !window.confirm(
                siteAdmin
                    ? `Promote user ${this.props.node.username} to site admin?`
                    : `Revoke site admin status from user ${this.props.node.username}?`
            )
        ) {
            return
        }

        this.setState({
            errorDescription: undefined,
            loading: true,
        })

        setUserIsSiteAdmin(this.props.node.id, siteAdmin)
            .toPromise()
            .then(
                () => {
                    this.setState({ loading: false })
                    if (this.props.onDidUpdate) {
                        this.props.onDidUpdate()
                    }
                },
                err => this.setState({ loading: false, errorDescription: err.message })
            )
    }

    private randomizePassword = () => {
        if (
            !window.confirm(
                `Reset the password for ${
                    this.props.node.username
                } to a random password? The user must reset their password to sign in again.`
            )
        ) {
            return
        }

        this.setState({
            errorDescription: undefined,
            resetPasswordURL: undefined,
            loading: true,
        })

        randomizeUserPassword(this.props.node.id)
            .toPromise()
            .then(
                ({ resetPasswordURL }) => {
                    this.setState({
                        loading: false,
                        resetPasswordURL,
                    })
                },
                err => this.setState({ loading: false, errorDescription: err.message })
            )
    }

    private deleteUser = () => this.doDeleteUser(false)
    private nukeUser = () => this.doDeleteUser(true)

    private doDeleteUser = (hard: boolean) => {
        let message = `Delete the user ${this.props.node.username}?`
        if (hard) {
            message = `Nuke the user ${this.props.node.username}?${nukeDetails}`
        }
        if (!window.confirm(message)) {
            return
        }

        this.setState({
            errorDescription: undefined,
            resetPasswordURL: undefined,
            loading: true,
        })

        deleteUser(this.props.node.id, hard)
            .toPromise()
            .then(
                () => {
                    this.setState({ loading: false })
                    if (this.props.onDidUpdate) {
                        this.props.onDidUpdate()
                    }
                },
                err => this.setState({ loading: false, errorDescription: err.message })
            )
    }
}

interface Props extends RouteComponentProps<any> {
    authenticatedUser: GQL.IUser
}

interface State {
    users?: GQL.IUser[]
    totalCount?: number
}

class FilteredUserConnection extends FilteredConnection<
    GQL.IUser,
    Pick<UserNodeProps, 'authenticatedUser' | 'onDidUpdate'>
> {}

/**
 * A page displaying the users on this site.
 */
export class SiteAdminAllUsersPage extends React.Component<Props, State> {
    public state: State = {}

    private userUpdates = new Subject<void>()
    private subscriptions = new Subscription()

    public componentDidMount(): void {
        eventLogger.logViewEvent('SiteAdminAllUsers')
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        const nodeProps: Pick<UserNodeProps, 'authenticatedUser' | 'onDidUpdate'> = {
            authenticatedUser: this.props.authenticatedUser,
            onDidUpdate: this.onDidUpdateUser,
        }

        return (
            <div className="site-admin-all-users-page">
                <PageTitle title="Users - Admin" />
                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                    <h2 className="mb-0">Users</h2>
                    <div>
                        <Link to="/site-admin/users/new" className="btn btn-primary">
                            <AddIcon className="icon-inline" /> Create user account
                        </Link>
                    </div>
                </div>
                <FilteredUserConnection
                    className="list-group list-group-flush mt-3"
                    noun="user"
                    pluralNoun="users"
                    queryConnection={fetchAllUsers}
                    nodeComponent={UserNode}
                    nodeComponentProps={nodeProps}
                    updates={this.userUpdates}
                    history={this.props.history}
                    location={this.props.location}
                />
            </div>
        )
    }

    private onDidUpdateUser = () => this.userUpdates.next()
}
