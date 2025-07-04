require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const cron = require('node-cron');

const parser = new Parser();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = process.env.TOKEN;

// Channel IDs from .env
const cybersécuritéChannel = process.env.CYBERSEC_CHANNEL;
const cloudChannel = process.env.CLOUD_CHANNEL;
const iaChannel = process.env.IA_CHANNEL;
const devChannel = process.env.DEV_CHANNEL;

client.once('ready', () => {
  console.log(`✅ Connected as ${client.user.tag}`);

  // Schedule job every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    postITNews();
  });
});

async function postITNews() {
  const feeds = [
    // Actualité
    { url: 'https://www.frandroid.com/feed', channelId: cloudChannel, topic: 'Actualité' },
    { url: 'https://www.01net.com/feed/', channelId: cloudChannel, topic: 'Actualité' },
    { url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml', channelId: cloudChannel, topic: 'Actualité' },
    { url: 'https://www.cnil.fr/fr/rss.xml', channelId: cloudChannel, topic: 'Actualité' },
    { url: 'https://bsky.app/profile/did:plc:3i4htisyibpap3mkxe2wam3x/rss', channelId: cloudChannel, topic: 'Actualité' },
    { url: 'http://feeds2.feedburner.com/LeJournalduGeek', channelId: cloudChannel, topic: 'Actualité' },

    // Cybersécurité
    { url: 'https://www.01net.com/tag/cybersecurite/feed/', channelId: cybersécuritéChannel, topic: 'Cybersécurité' },
    { url: 'https://cyber.gouv.fr/actualites/feed', channelId: cybersécuritéChannel, topic: 'Cybersécurité' },
    { url: 'https://www.lemagit.fr/rss/ContentSyndication.xml', channelId: cybersécuritéChannel, topic: 'Cybersécurité' },
    { url: 'https://www.silicon.fr/rss/toutelinfo', channelId: cybersécuritéChannel, topic: 'Cybersécurité' },
    { url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml', channelId: cybersécuritéChannel, topic: 'Cybersécurité' },

    // Intelligence Artificielle
    { url: 'https://www.huffingtonpost.fr/intelligence-artificielle/rss_headline.xml', channelId: iaChannel, topic: 'IA' },
    { url: 'https://www.larevuedudigital.com/category/bigdata/feed', channelId: iaChannel, topic: 'IA' },
    { url: 'https://www.journaldunet.com/intelligence-artificielle/rss/', channelId: iaChannel, topic: 'IA' },

    // Développement
    { url: 'https://datacorner.fr/feed/', channelId: devChannel, topic: 'Développement' },
    { url: 'http://feeds.feedburner.com/techcrunch/JORt', channelId: devChannel, topic: 'Développement' },

    // Podcasts
    { url: 'https://feeds.audiomeans.fr/feed/d6ddb849-3100-43b2-91a5-93f54fe4c4b5.xml', channelId: cloudChannel, topic: 'Podcast' }
    // Note: Spotify link is not RSS, skipped for bot fetching
  ];

  for (const feedInfo of feeds) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      const latest = feed.items[0];

      const channel = await client.channels.fetch(feedInfo.channelId);
      channel.send(`📰 **${feedInfo.topic} - Actu du jour**\n**Titre:** ${latest.title}\n**Lien:** ${latest.link}`);
    } catch (error) {
      console.error(`❌ Error fetching ${feedInfo.topic} news from ${feedInfo.url}:`, error);
    }
  }
}

client.login(token);
