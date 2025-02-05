const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper functions for common database operations
const db = {
  query: (text, params) => pool.query(text, params),

  getClient: () => pool.connect(),

  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // User operations
  createUser: async (privyUserId, displayName, email, walletAddress) => {
    const query = `
      INSERT INTO users (privy_user_id, display_name, email, wallet_address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [privyUserId, displayName, email, walletAddress]);
    return rows[0];
  },

  updateUser: async (userId, data) => {
    const query = `
      UPDATE users
      SET display_name = COALESCE($2, display_name),
          email = COALESCE($3, email),
          wallet_address = COALESCE($4, wallet_address)
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      userId,
      data.displayName,
      data.email,
      data.walletAddress
    ]);
    return rows[0];
  },

  // Contact operations
  addContact: async (userId, name, walletAddress) => {
    const query = `
      INSERT INTO contacts (user_id, name, wallet_address)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, name, walletAddress]);
    return rows[0];
  },

  getContacts: async (userId) => {
    const query = `
      SELECT *
      FROM contacts
      WHERE user_id = $1
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  // Transaction operations
  createTransaction: async (senderId, recipientAddress, amount, recipientId = null) => {
    const query = `
      INSERT INTO transactions (sender_id, recipient_id, recipient_address, amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [senderId, recipientId, recipientAddress, amount]);
    return rows[0];
  },

  updateTransactionStatus: async (txId, status, txHash = null) => {
    const query = `
      UPDATE transactions
      SET status = $2,
          tx_hash = COALESCE($3, tx_hash)
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [txId, status, txHash]);
    return rows[0];
  },

  getTransactionHistory: async (userId) => {
    const query = `
      SELECT t.*,
             s.display_name as sender_name,
             s.wallet_address as sender_address,
             r.display_name as recipient_name
      FROM transactions t
      LEFT JOIN users s ON t.sender_id = s.id
      LEFT JOIN users r ON t.recipient_id = r.id
      WHERE t.sender_id = $1 OR t.recipient_id = $1
      ORDER BY t.created_at DESC
      LIMIT 50
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
};

module.exports = db;
