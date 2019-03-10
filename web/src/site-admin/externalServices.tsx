import React from 'react'
import awsCodeCommitSchemaJSON from '../../../schema/aws_codecommit.schema.json'
import bitbucketServerSchemaJSON from '../../../schema/bitbucket_server.schema.json'
import githubSchemaJSON from '../../../schema/github.schema.json'
import gitlabSchemaJSON from '../../../schema/gitlab.schema.json'
import gitoliteSchemaJSON from '../../../schema/gitolite.schema.json'
import otherExternalServiceSchemaJSON from '../../../schema/other_external_service.schema.json'
import phabricatorSchemaJSON from '../../../schema/phabricator.schema.json'
import * as GQL from '../../../shared/src/graphql/schema'

export interface ExternalServiceMetadata {
    jsonSchema: { $id: string }
    defaultConfig: string

    /**
     * Default display name
     */
    displayName: string

    title: string

    shortDescription?: string // TODO: make required

    longDescription?: JSX.Element | string
}

export const GITHUB_EXTERNAL_SERVICE: ExternalServiceMetadata = {
    title: 'GitHub repositories',
    jsonSchema: githubSchemaJSON,
    displayName: 'GitHub',
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

// type ExternalServicesMetadata = {
//     default: ExternalServiceMetadata
// } & { [K in ExternalServiceQualifier]?: ExternalServiceMetadata }

const OTHER_EXTERNAL_SERVICES: Record<GQL.ExternalServiceKind, ExternalServiceMetadata> = {
    [GQL.ExternalServiceKind.AWSCODECOMMIT]: {
        title: 'AWS CodeCommit repositories',
        jsonSchema: awsCodeCommitSchemaJSON,
        displayName: 'AWS CodeCommit',
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
        jsonSchema: bitbucketServerSchemaJSON,
        displayName: 'Bitbucket Server',
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
        jsonSchema: gitlabSchemaJSON,
        displayName: 'GitLab',
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
        jsonSchema: gitoliteSchemaJSON,
        displayName: 'Gitolite',
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
        jsonSchema: phabricatorSchemaJSON,
        displayName: 'Phabricator',
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
        title: 'repositories by Git clone URL',
        jsonSchema: otherExternalServiceSchemaJSON,
        displayName: 'Other',
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

export const ALL_EXTERNAL_SERVICES = {
    [GQL.ExternalServiceKind.GITHUB]: GITHUB_EXTERNAL_SERVICE,
    ...OTHER_EXTERNAL_SERVICES,
}

export function getExternalService(kind: GQL.ExternalServiceKind): ExternalServiceMetadata {
    return ALL_EXTERNAL_SERVICES[kind]
}

type ExternalServiceQualifier = 'dotcom' | 'enterprise'

export interface AddExternalServiceMetadata
    extends Partial<
        Pick<
            ExternalServiceMetadata,
            'displayName' | 'title' | 'shortDescription' | 'longDescription' | 'defaultConfig'
        >
    > {
    externalServiceKind: GQL.ExternalServiceKind
    externalService: ExternalServiceMetadata
    qualifier?: ExternalServiceQualifier // TODO: rename
}

export const ALL_ADD_EXTERNAL_SERVICES: AddExternalServiceMetadata[] = ([
    {
        externalServiceKind: GQL.ExternalServiceKind.GITHUB,
        externalService: getExternalService(GQL.ExternalServiceKind.GITHUB),
        qualifier: 'dotcom',
    },
    {
        externalServiceKind: GQL.ExternalServiceKind.GITHUB,
        externalService: getExternalService(GQL.ExternalServiceKind.GITHUB),
        qualifier: 'enterprise',
    },
] as AddExternalServiceMetadata[]).concat(Object.keys(OTHER_EXTERNAL_SERVICES).map(kind => ({
    externalServiceKind: kind as GQL.ExternalServiceKind,
    externalService: getExternalService(kind as GQL.ExternalServiceKind),
})) as AddExternalServiceMetadata[])
