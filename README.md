# Snacks

A slack bot that can sell/buy food in slack app

## Development
```bash
git clone https://github.com/jay16213/snacks.git

# install dependencies
npm install

# config your own development environment from .env.example
cp .env.example .env.development

# run dev server
npm run dev
```

## Deploy
```bash
docker build .
docker-compose up -d
```

### Database backup
```bash
bash monbodb-backup.sh
```
