const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const bridgeApi = {
  convertFiatToUSDC: async (amount: number, userAddress: string) => {
    return fetchApi('/api/bridge/convert', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        userAddress,
      }),
    });
  },
};

export const paymentsApi = {
  getBalance: async (address: string) => {
    return fetchApi(`/api/payments/balance/${address}`);
  },

  sendPayment: async (recipientAddress: string, amount: string, senderWallet: string) => {
    return fetchApi('/api/payments/send', {
      method: 'POST',
      body: JSON.stringify({
        recipientAddress,
        amount,
        senderPrivyWallet: senderWallet,
      }),
    });
  },
};

export const usersApi = {
  updateProfile: async (userId: string, data: any) => {
    return fetchApi(`/api/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getContacts: async (userId: string) => {
    return fetchApi(`/api/users/${userId}/contacts`);
  },

  addContact: async (userId: string, contactData: any) => {
    return fetchApi(`/api/users/${userId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },
};
