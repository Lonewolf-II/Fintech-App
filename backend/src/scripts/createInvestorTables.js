import { sequelize, Investor, InvestorCategory, CategoryAccountAssignment, Investment, ProfitDistribution } from '../models/index.js';

async function createInvestorTables() {
    try {
        console.log('Creating investor management tables...');

        // Create tables in order (respecting foreign key dependencies)
        await Investor.sync({ alter: true });
        console.log('✓ Investor table created');

        await InvestorCategory.sync({ alter: true });
        console.log('✓ InvestorCategory table created');

        await CategoryAccountAssignment.sync({ alter: true });
        console.log('✓ CategoryAccountAssignment table created');

        await Investment.sync({ alter: true });
        console.log('✓ Investment table created');

        await ProfitDistribution.sync({ alter: true });
        console.log('✓ ProfitDistribution table created');

        console.log('All investor tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating investor tables:', error);
        process.exit(1);
    }
}

createInvestorTables();
