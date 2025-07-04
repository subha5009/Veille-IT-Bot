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

  // Schedule job every minute
  cron.schedule('* * * * *', () => {
    postITNews();
  });
});

async function postITNews() {
  const feeds = [
    {
      url: 'https://www.csoonline.com/index.rss',
      channelId: cybersécuritéChannel,
      topic: 'Cybersécurité'
    },
    {
      url: 'https://www.zdnet.com/topic/cloud/rss.xml',
      channelId: cloudChannel,
      topic: 'Cloud'
    },
    {
      url: 'https://www.technologyreview.com/feed/',
      channelId: iaChannel,
      topic: 'IA'
    },
    {
      url: 'https://www.techrepublic.com/rssfeeds/topic/developer/',
      channelId: devChannel,
      topic: 'Développement'
    }
  ];

  for (const feedInfo of feeds) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      const latest = feed.items[0];

      const channel = await client.channels.fetch(feedInfo.channelId);
      channel.send(`📰 **${feedInfo.topic} - Actu du jour**\n**Titre:** ${latest.title}\n**Lien:** ${latest.link}`);
    } catch (error) {
      console.error(`❌ Error fetching ${feedInfo.topic} news:`, error);
    }
  }
}

client.login(token);
