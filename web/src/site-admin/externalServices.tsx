import { flatMap, map } from 'lodash'
import AmazonIcon from 'mdi-react/AmazonIcon'
import BitbucketIcon from 'mdi-react/BitbucketIcon'
import GithubCircleIcon from 'mdi-react/GithubCircleIcon'
import GitIcon from 'mdi-react/GitIcon'
import GitLabIcon from 'mdi-react/GitlabIcon'
import React from 'react'
import awsCodeCommitSchemaJSON from '../../../schema/aws_codecommit.schema.json'
import bitbucketServerSchemaJSON from '../../../schema/bitbucket_server.schema.json'
import githubSchemaJSON from '../../../schema/github.schema.json'
import gitlabSchemaJSON from '../../../schema/gitlab.schema.json'
import gitoliteSchemaJSON from '../../../schema/gitolite.schema.json'
import otherExternalServiceSchemaJSON from '../../../schema/other_external_service.schema.json'
import phabricatorSchemaJSON from '../../../schema/phabricator.schema.json'
import * as GQL from '../../../shared/src/graphql/schema'

const iconSize = 50

export const PhabricatorIcon: React.FunctionComponent<{ size: number }> = props => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        height={props.size}
        width={props.size}
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

export interface ExternalServiceMetadata {
    title: string

    icon: JSX.Element | string

    color: string

    shortDescription: string

    longDescription?: JSX.Element | string

    jsonSchema: { $id: string }

    /**
     * Default display name
     */
    defaultDisplayName: string
    defaultConfig: string
}

export const GITHUB_EXTERNAL_SERVICE: ExternalServiceMetadata = {
    title: 'GitHub repositories',
    icon: <GithubCircleIcon size={iconSize} />,
    jsonSchema: githubSchemaJSON,
    defaultDisplayName: 'GitHub',
    color: '#2ebc4f',
    shortDescription: 'Add GitHub repositories.',
    longDescription: (
        <span>
            Adding this configuration enables Sourcegraph to sync repositories from GitHub. Click the "quick configure"
            buttons for common actions or directly edit the JSON configuration.{' '}
            <a
                target="_blank"
                href="https://docs.sourcegraph.com/integration/github#github-integration-with-sourcegraph"
            >
                Read the docs
            </a>{' '}
            for more info about each field.
        </span>
    ),
    defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#githubconnection-object

  "url": "https://github.com",

  // A token is required for access to private repos, but is also helpful for public repos
  // because it grants a higher hourly rate limit to Sourcegraph.
  // Create one with the repo scope at https://[your-github-instance]/settings/tokens/new
  "token": "",

  // Sync public repositories from https://github.com by adding them to "repos".
  // (This is not necessary for GitHub Enterprise instances)
  // "repos": [
  //     "sourcegraph/sourcegraph"
  // ]

}`,
}

const OTHER_EXTERNAL_SERVICES = {
    [GQL.ExternalServiceKind.AWSCODECOMMIT]: {
        title: 'AWS CodeCommit repositories',
        icon: <AmazonIcon size={iconSize} />,
        color: '#f8991d',
        shortDescription: 'Add AWS CodeCommit repositories.',
        jsonSchema: awsCodeCommitSchemaJSON,
        defaultDisplayName: 'AWS CodeCommit',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#awscodecommitconnection-object

  "region": "",
  "accessKeyID": "",
  "secretAccessKey": ""
}`,
    },
    [GQL.ExternalServiceKind.BITBUCKETSERVER]: {
        title: 'Bitbucket Server repositories',
        icon: <BitbucketIcon size={iconSize} />,
        color: '#2684ff',
        shortDescription: 'Add Bitbucket Server repositories.',
        jsonSchema: bitbucketServerSchemaJSON,
        defaultDisplayName: 'Bitbucket Server',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#bitbucketserverconnection-object

  "url": "https://bitbucket.example.com",

  // Create a personal access token with read scope at
  // https://[your-bitbucket-hostname]/plugins/servlet/access-tokens/add
  "token": ""
}`,
    },
    [GQL.ExternalServiceKind.GITLAB]: {
        title: 'GitLab projects',
        icon: <GitLabIcon size={iconSize} />,
        color: '#fc6e26',
        shortDescription: 'Add GitLab projects.',
        jsonSchema: gitlabSchemaJSON,
        defaultDisplayName: 'GitLab',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#gitlabconnection-object

  "url": "https://gitlab.example.com",

  // Create a personal access token with api scope at
  // https://[your-gitlab-hostname]/profile/personal_access_tokens
  "token": ""
}`,
    },
    [GQL.ExternalServiceKind.GITOLITE]: {
        title: 'Gitolite repositories',
        icon: <GitIcon size={iconSize} />,
        color: '#e0e0e0',
        shortDescription: 'Add Gitolite repositories.',
        jsonSchema: gitoliteSchemaJSON,
        defaultDisplayName: 'Gitolite',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#gitoliteconnection-object

  "prefix": "gitolite.example.com/",
  "host": "git@gitolite.example.com"
}`,
    },
    [GQL.ExternalServiceKind.PHABRICATOR]: {
        title: 'Phabricator connection',
        icon: <PhabricatorIcon size={iconSize} />,
        color: '#4a5f88',
        shortDescription: 'Add links to Phabricator from Sourcegraph.',
        jsonSchema: phabricatorSchemaJSON,
        defaultDisplayName: 'Phabricator',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#phabricatorconnection-object

  "url": "https://phabricator.example.com",
  "token": "",
  "repos": []
}`,
    },
    [GQL.ExternalServiceKind.OTHER]: {
        title: 'Single Git repositories',
        icon: <GitIcon size={iconSize} />,
        color: '#f14e32',
        shortDescription: 'Add single Git repositories by clone URL.',
        jsonSchema: otherExternalServiceSchemaJSON,
        defaultDisplayName: 'Git repositories',
        defaultConfig: `{
  // Use Ctrl+Space for completion, and hover over JSON properties for documentation.
  // Configuration options are documented here:
  // https://docs.sourcegraph.com/admin/site_config/all#otherexternalserviceconnection-object

  // Supported URL schemes are: http, https, git and ssh
  "url": "https://my-other-githost.example.com",

  // Repository clone paths may be relative to the url (preferred) or absolute.
  "repos": []
}`,
    },
}

export const ALL_EXTERNAL_SERVICES: Record<GQL.ExternalServiceKind, ExternalServiceMetadata> = {
    [GQL.ExternalServiceKind.GITHUB]: GITHUB_EXTERNAL_SERVICE,
    ...OTHER_EXTERNAL_SERVICES,
}

export function getExternalService(kind: GQL.ExternalServiceKind): ExternalServiceMetadata {
    return ALL_EXTERNAL_SERVICES[kind]
}

type ExternalServiceQualifier = 'dotcom' | 'enterprise'

export interface AddExternalServiceMetadata extends ExternalServiceMetadata {
    serviceKind: GQL.ExternalServiceKind
    qualifier?: ExternalServiceQualifier
}

// const externalService
// map(OTHER_EXTERNAL_SERVICES, (service): ExternalServiceMetadataPatch => {
//     return
// })
const addPatches: Partial<
    Record<GQL.ExternalServiceKind, Partial<Record<ExternalServiceQualifier, Partial<ExternalServiceMetadata>>>>
> = {
    [GQL.ExternalServiceKind.GITHUB]: {
        dotcom: {
            title: 'GitHub.com repositories',
            shortDescription: 'Add GitHub.com repositories.',
        },
        enterprise: {
            title: 'GitHub Enterprise repositories',
            shortDescription: 'Add GitHub Enterprise repositories.',
        },
    },
}

map(ALL_EXTERNAL_SERVICES, () => {
    console.log()
    return void 0
})

export const ALL_ADD_EXTERNAL_SERVICES: AddExternalServiceMetadata[] = flatMap(
    map(
        ALL_EXTERNAL_SERVICES,
        (
            service: ExternalServiceMetadata,
            kindString: string
        ): AddExternalServiceMetadata | AddExternalServiceMetadata[] => {
            const kind = kindString as GQL.ExternalServiceKind
            if (addPatches[kind]) {
                const patches = addPatches[kind]
                return map(patches, (patch, qualifierString) => {
                    const qualifier = qualifierString as ExternalServiceQualifier
                    return {
                        ...service,
                        serviceKind: kind,
                        qualifier,
                        ...patch,
                    }
                })
            }
            return {
                ...service,
                serviceKind: kind,
            }
        }
    )
)
