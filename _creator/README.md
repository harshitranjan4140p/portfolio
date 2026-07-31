# Local Creator Dashboard

Double-click `Start Creator Dashboard.cmd`.

The portfolio opens at `http://localhost:4140/`. Right-click anywhere and
choose **Creator Dashboard**, then enter the local unlock code.

Initial code: `4140p`

Change the code in **Security** after the first sign-in. The saved secret is a
salted hash in `.secret.json`, which is ignored by Git. The server binds only to
`127.0.0.1`; it cannot be reached from another device.

Use **Save locally** while editing. Use **Publish** only when the preview looks
right. Publishing stages only `content`, `projects.js`, and `assets`, then
commits and pushes those portfolio content changes.
