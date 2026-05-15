#!/usr/bin/env node
// Gera chaves VAPID para push notifications
// Uso: node scripts/generate-vapid.js
// Requer web-push instalado: npm install web-push --legacy-peer-deps

import webPush from 'web-push'

const keys = webPush.generateVAPIDKeys()

console.log('\n✅ VAPID keys geradas! Adicione ao seu .env:\n')
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log(`VAPID_EMAIL=admin@flowos.app`)
console.log(`\n# Para o frontend (Vite):`)
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log()
