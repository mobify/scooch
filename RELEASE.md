# Scooch Release Checklist

Take this checklist and paste it into your release PR. Ensure steps are followed in order.

- [ ] Make sure JS linting passes with `grunt lint`
- [ ] Increment the version in `package.json`.
  - This is determined by the changes since the last release, using [Semantic Versioning](www.semver.org).
- [ ] Update `CHANGELOG`.
  - Describe large internal changes or anything that will affect users.
- [ ] Branch off `develop` and create a `release-X.X.X` branch.
- [ ] Commit and push up your changes to `package.json` and `CHANGELOG`.
- [ ] Open a release PR from your new `release-X.X.X` branch into `master`
- [ ] Get your PR reviewed and +1'ed
- [ ] Merge this release branch into `master` and tag it. Delete release branch.
- [ ] Publish a new GitHub [release](https://github.com/mobify/adaptivejs/releases) from the new tag.
- [ ] Merge `master` into `develop`.
- [ ] Update your local: `git pull`.
- [ ] Release on S3 and npm: `grunt publish && npm publish`
