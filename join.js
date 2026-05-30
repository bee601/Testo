// join.js – Discord Account Creator + Real Server Join
// Installation: npm install puppeteer
// Ausführung: node join.js

const puppeteer = require('puppeteer');

// ========== KONFIGURATION ==========
const INVITE_LINK = 'https://discord.gg/NEzuex49s5';
const ACCOUNT_COUNT = 5;  // Anzahl der Accounts
// ===================================

function randomName() {
    const p = ['nick', 'max', 'tim', 'tom', 'felix', 'jan', 'leo', 'paul', 'kev', 'chris', 'andi', 'basti', 'flo', 'luca', 'julian', 'simon', 'daniel', 'phil', 'marc', 'dennis'];
    const m = ['der', 'die', 'von', 'mit', 'und', 'aus', 'bei', 'nach', 'vor', 'hinter', 'unter', 'über'];
    const s = ['dick', 'cool', 'king', 'lord', 'hunter', 'beast', 'wolf', 'fuchs', 'adler', 'tiger', 'löwe', 'bär', 'falke', 'ritter', 'krieger'];
    
    let name = p[Math.floor(Math.random() * p.length)] +
               m[Math.floor(Math.random() * m.length)] +
               s[Math.floor(Math.random() * s.length)] +
               (Math.floor(Math.random() * 9000) + 100);
    
    for(let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
        name += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    }
    return name.toLowerCase();
}

function randomEmail(username) {
    const domains = ['guerrillamail.org', '10minutemail.net', 'mailinator.com', 'temp-mail.org', 'throwaway.email'];
    return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAccountAndJoin(browser, accountNum) {
    const page = await browser.newPage();
    
    try {
        console.log(`\n[${accountNum}/${ACCOUNT_COUNT}] Erstelle Account...`);
        
        await page.goto('https://discord.com/register', { waitUntil: 'networkidle2' });
        await sleep(2000);
        
        const username = randomName();
        const email = randomEmail(username);
        const password = `Disc${Math.random().toString(36).slice(-10)}!Aa${Math.floor(Math.random() * 999)}`;
        
        console.log(`   👤 Username: ${username}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Password: ${password}`);
        
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', email);
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        
        await page.select('select[name="birthday_day"]', String(Math.floor(Math.random() * 28) + 1));
        await page.select('select[name="birthday_month"]', String(Math.floor(Math.random() * 12) + 1));
        await page.select('select[name="birthday_year"]', String(Math.floor(Math.random() * (2005 - 1985) + 1985)));
        
        await page.click('button[type="submit"]');
        await sleep(5000);
        
        const hasCaptcha = await page.$('iframe[title*="captcha"], .captcha-container');
        if(hasCaptcha) {
            console.log('   ⚠️ Captcha erkannt! Bitte in 30 Sekunden lösen...');
            await sleep(30000);
        }
        
        const currentUrl = page.url();
        if(currentUrl.includes('channels') || currentUrl.includes('app')) {
            console.log('   ✅ Account erfolgreich erstellt!');
            
            console.log(`   🔗 Trete Server bei: ${INVITE_LINK}`);
            await page.goto(INVITE_LINK, { waitUntil: 'networkidle2' });
            await sleep(3000);
            
            const acceptBtn = await page.$('button[aria-label="Accept Invite"]');
            if(acceptBtn) {
                await acceptBtn.click();
                await sleep(2000);
                console.log('   🎉 SERVER BEIGETRETEN!');
                return true;
            } else {
                console.log('   ❌ Kein Accept-Button gefunden');
                return false;
            }
        } else {
            console.log('   ❌ Account Erstellung fehlgeschlagen');
            return false;
        }
    } catch(err) {
        console.log(`   ❌ Fehler: ${err.message}`);
        return false;
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Discord Account Creator + Joiner     ║');
    console.log('║   Real Server Join mit Puppeteer       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n🎯 Zielserver: ${INVITE_LINK}`);
    console.log(`📊 Accounts: ${ACCOUNT_COUNT}\n`);
    
    let successCount = 0;
    
    for(let i = 1; i <= ACCOUNT_COUNT; i++) {
        const browser = await puppeteer.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const success = await createAccountAndJoin(browser, i);
        if(success) successCount++;
        
        await browser.close();
        
        if(i < ACCOUNT_COUNT) {
            console.log(`   ⏳ Warte 10 Sekunden vor nächstem Account...`);
            await sleep(10000);
        }
    }
    
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║   🎉 FERTIG!                         ║`);
    console.log(`║   ✅ Erfolgreich: ${successCount}/${ACCOUNT_COUNT} Accounts  ║`);
    console.log(`╚════════════════════════════════════════╝`);
}

main();
