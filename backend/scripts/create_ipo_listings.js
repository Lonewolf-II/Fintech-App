import sequelize from '../src/config/database.js';
import IPOListing from '../src/models/IPOListing.js';

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        await IPOListing.sync({ force: true });
        console.log('IPOListing table created.');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
};

migrate();
