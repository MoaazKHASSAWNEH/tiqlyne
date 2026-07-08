# Security Policy

## Supported versions

Tiqlyne Motion Engine is currently preparing its first public pre-release.

| Version | Supported              |
| ------- | ---------------------- |
| 0.1.x   | Yes, after publication |

## Reporting a vulnerability

If you discover a security issue, please do not open a public issue with exploit details.

Report it privately to the repository owner. Include:

- affected package and version;
- reproduction steps;
- expected and actual behavior;
- impact assessment;
- any suggested mitigation.

## Scope

Security-sensitive areas include:

- unsafe handling of external motion configuration;
- package publication and dependency metadata;
- browser driver behavior around DOM targets;
- unexpected execution of user-provided values.

The core package should treat external configuration as untrusted and normalize it before use.
