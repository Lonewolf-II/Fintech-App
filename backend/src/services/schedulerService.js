import { IPOListing } from '../models/index.js';
import { Op } from 'sequelize';

// Helper to combine date and time strings into a Date object
const combineDateTime = (dateStr, timeStr) => {
    if (!timeStr) return new Date(dateStr + 'T00:00:00');
    return new Date(`${dateStr}T${timeStr}`);
};

// Check and update IPO statuses
const checkIPOStatuses = async () => {
    try {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        // 1. Open "Upcoming" IPOs
        // Condition: openDate <= today AND (openDate < today OR openTime <= now)
        // Simplification for SQL: openDate < today OR (openDate = today AND openTime <= now)
        const upcomingIPOs = await IPOListing.findAll({
            where: {
                status: 'upcoming',
                [Op.or]: [
                    { openDate: { [Op.lt]: currentDate } },
                    {
                        openDate: currentDate,
                        openTime: { [Op.lte]: currentTime }
                    }
                ]
            }
        });

        if (upcomingIPOs.length > 0) {
            console.log(`Scheduler: Found ${upcomingIPOs.length} IPOs to OPEN.`);
            for (const ipo of upcomingIPOs) {
                await ipo.update({ status: 'open' });
                console.log(`Scheduler: IPO ${ipo.companyName} is now OPEN.`);
            }
        }

        // 2. Close "Open" IPOs
        // Condition: autoClose is true AND (closeDate < today OR (closeDate = today AND closeTime <= now))
        const openIPOs = await IPOListing.findAll({
            where: {
                status: 'open',
                autoClose: true,
                [Op.or]: [
                    { closeDate: { [Op.lt]: currentDate } },
                    {
                        closeDate: currentDate,
                        closeTime: { [Op.lte]: currentTime }
                    }
                ]
            }
        });

        if (openIPOs.length > 0) {
            console.log(`Scheduler: Found ${openIPOs.length} IPOs to CLOSE.`);
            for (const ipo of openIPOs) {
                try {
                    console.log(`Scheduler: Closing IPO ${ipo.companyName}.`);
                    await ipo.update({ status: 'closed' });
                    console.log(`Scheduler: IPO ${ipo.companyName} is now CLOSED.`);
                } catch (err) {
                    console.error(`Scheduler: Failed to CLOSE IPO ${ipo.id}`, err);
                }
            }
        }

        // 3. Shift "Closed" IPOs to "Allotted"
        // Condition: allotmentDate < today OR (allotmentDate = today AND allotmentTime <= now)
        const closedIPOs = await IPOListing.findAll({
            where: {
                status: 'closed',
                [Op.or]: [
                    { allotmentDate: { [Op.lt]: currentDate } },
                    {
                        allotmentDate: currentDate,
                        allotmentTime: { [Op.lte]: currentTime }
                    }
                ]
            }
        });

        if (closedIPOs.length > 0) {
            console.log(`Scheduler: Found ${closedIPOs.length} IPOs to mark as ALLOTTED.`);
            for (const ipo of closedIPOs) {
                try {
                    // Ensure we don't overwrite if manually set to something else, but here we query for 'closed' specifically
                    await ipo.update({ status: 'allotted' });
                    console.log(`Scheduler: IPO ${ipo.companyName} is now ALLOTTED (Phase).`);
                } catch (err) {
                    console.error(`Scheduler: Failed to mark ALLOTTED IPO ${ipo.id}`, err);
                }
            }
        }

    } catch (error) {
        console.error('Scheduler Error:', error);
    }
};

// Initialize Scheduler
export const startScheduler = () => {
    console.log('Starting IPO Scheduler Service (Interval: 1 minute)...');

    // Run immediately on start
    checkIPOStatuses();

    // Run every 60 seconds (60000 ms)
    setInterval(checkIPOStatuses, 60000);
};
