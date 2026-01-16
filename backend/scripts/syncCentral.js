import { centralSequelize } from '../central-db/index.js';

const syncCentralDb = async () => {
    try {
        console.log('Syncing Central DB...');
        await centralSequelize.sync({ alter: true });
        console.log('✅ Central DB synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to sync Central DB:', error);
        process.exit(1);
    }
};

syncCentralDb();
