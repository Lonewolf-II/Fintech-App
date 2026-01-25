import sequelize from '../backend/src/config/database.js';

const fixEnum = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Fixing ENUM "enum_ipo_listings_status"...');

        // Add "result_published"
        try {
            await sequelize.query(`ALTER TYPE "enum_ipo_listings_status" ADD VALUE 'result_published';`);
            console.log('Added "result_published" to ENUM.');
        } catch (err) {
            console.log('Error adding "result_published" (might already exist):', err.message);
        }

        try {
            await sequelize.query(`ALTER TYPE "enum_ipo_listings_status" ADD VALUE 'allotted';`);
            console.log('Added "allotted" to ENUM.');
        } catch (err) {
            console.log('Error adding "allotted" (might already exist):', err.message);
        }

        console.log('Fixing ENUM "enum_transactions_transaction_type"...');

        const txnTypes = ['ipo_hold', 'ipo_release', 'ipo_allotment', 'fee_deduction', 'share_sale', 'profit_distribution', 'principal_return'];

        for (const type of txnTypes) {
            try {
                // Try lowercase table name first (most likely)
                await sequelize.query(`ALTER TYPE "enum_transactions_transaction_type" ADD VALUE '${type}';`);
                console.log(`Added "${type}" to ENUM.`);
            } catch (err) {
                // Ignore if exists, but log if other error
                if (!err.message.includes('already exists')) {
                    // Try Capitalized Table Name Just in Case
                    try {
                        await sequelize.query(`ALTER TYPE "enum_Transactions_transaction_type" ADD VALUE '${type}';`);
                        console.log(`Added "${type}" to ENUM (Capitalized).`);
                    } catch (err2) {
                        console.log(`Error adding "${type}" (might already exist):`, err2.message);
                    }
                } else {
                    console.log(`"${type}" already exists.`);
                }
            }
        }

        console.log('Fix complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

fixEnum();
