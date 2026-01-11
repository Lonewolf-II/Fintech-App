import { ModificationRequest, Account, Customer, User } from '../models/index.js';

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await ModificationRequest.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'requester', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
};

export const actionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body; // action: 'approve' | 'reject'
        const requests = await ModificationRequest.findByPk(id);

        if (!requests) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (requests.status !== 'pending') {
            return res.status(400).json({ error: 'Request is already processed' });
        }

        if (action === 'approve') {
            // Apply changes
            if (requests.targetModel === 'Account') {
                const account = await Account.findByPk(requests.targetId);
                if (account) {
                    await account.update(requests.requestedChanges);
                }
            }
            // Add other models here if needed

            requests.status = 'approved';
        } else if (action === 'reject') {
            requests.status = 'rejected';
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        requests.reviewedBy = req.user.id;
        requests.reviewNotes = notes;
        await requests.save();

        res.json(requests);
    } catch (error) {
        console.error('Action request error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
