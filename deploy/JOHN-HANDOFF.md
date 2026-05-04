# John handoff

Repo path on VPS:
- /root/.openclaw/workspace/openclaw-office

Live deploy path:
- /srv/openclaw-office

To pull latest changes and redeploy:

```bash
cd /root/.openclaw/workspace/openclaw-office
# if connected to git remote:
git pull --ff-only
npm install
npm run build
rsync -a --delete dist/ /srv/openclaw-office/
cp server.mjs /srv/openclaw-office/server.mjs
systemctl restart openclaw-office.service
```

Verify:

```bash
curl -u 'admin:***' https://office.esportsza.co.za/api/office-state | jq '.agents | map(.id)'
systemctl status openclaw-office --no-pager
```

Current expected live agents:
- alicia
- angela
- oryn
- john
- lia
- presh
