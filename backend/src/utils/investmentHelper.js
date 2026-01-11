import { Investment, Investor, CategoryAccountAssignment, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Helper function to create investment when IPO shares are allotted
 * Called from checker controller when approving allotment
 */
export const createInvestmentFromAllotment = async (ipoApplication, transaction) => {
    try {
        // Find if this account is assigned to an investor category
        const assignment = await CategoryAccountAssignment.findOne({
            where: {
                accountId: ipoApplication.accountId || null,
                customerId: ipoApplication.customerId
            },
            include: [
                {
                    association: 'category',
                    include: ['investor']
                }
            ],
            transaction
        });

        if (!assignment || !assignment.category || !assignment.category.investor) {
            // No investor assigned, skip investment creation
            console.log(`No investor assigned for customer ${ipoApplication.customerId}, skipping investment creation`);
            return null;
        }

        const investor = assignment.category.investor;

        // Calculate investment amount
        const principalAmount = parseFloat(ipoApplication.totalAmount);
        const sharesAllocated = parseInt(ipoApplication.quantity);
        const costPerShare = parseFloat(ipoApplication.pricePerShare);

        // Validate investor has sufficient capital
        if (parseFloat(investor.availableCapital) < principalAmount) {
            throw new Error(`Investor ${investor.name} has insufficient capital for this investment`);
        }

        // Generate investment ID
        const prefix = 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const latestInvestment = await Investment.findOne({
            where: {
                investmentId: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['investmentId', 'DESC']],
            attributes: ['investmentId'],
            transaction
        });

        let nextSequence = 1;
        if (latestInvestment && latestInvestment.investmentId) {
            const currentSequence = parseInt(latestInvestment.investmentId.substring(prefix.length));
            if (!isNaN(currentSequence)) {
                nextSequence = currentSequence + 1;
            }
        }

        const investmentId = `${prefix}${nextSequence.toString().padStart(4, '0')}`;

        // Get account ID (find primary account if not specified)
        let accountId = ipoApplication.accountId;
        if (!accountId) {
            const { Account } = await import('../models/index.js');
            const account = await Account.findOne({
                where: { customerId: ipoApplication.customerId, isPrimary: true },
                transaction
            });
            accountId = account?.id;
        }

        // Create investment
        const investment = await Investment.create({
            investmentId,
            investorId: investor.id,
            customerId: ipoApplication.customerId,
            accountId,
            ipoApplicationId: ipoApplication.id,
            principalAmount,
            sharesAllocated,
            costPerShare,
            totalCost: principalAmount,
            sharesHeld: sharesAllocated,
            currentMarketPrice: costPerShare,
            currentValue: principalAmount,
            status: 'active',
            investedAt: new Date()
        }, { transaction });

        // Update investor capital
        await investor.update({
            investedAmount: parseFloat(investor.investedAmount) + principalAmount,
            availableCapital: parseFloat(investor.availableCapital) - principalAmount
        }, { transaction });

        console.log(`✓ Created investment ${investmentId} for investor ${investor.name}`);
        return investment;
    } catch (error) {
        console.error('Error creating investment from allotment:', error);
        throw error;
    }
};
