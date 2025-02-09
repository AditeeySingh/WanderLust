document.addEventListener('DOMContentLoaded', () => {
    const amount = document.getElementById('amount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swapCurrencies');
    const conversionText = document.getElementById('conversionText');
    const resultAmount = document.getElementById('resultAmount');

    // Common currencies to show at the top of the list
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

    // Update the exchange rates API endpoint
    async function fetchExchangeRates(base) {
        try {
            const response = await fetch(`${API_URL}/api/exchange-rates/${base}`);
            const data = await response.json();
            return data.conversion_rates;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return null;
        }
    }
    
    async function populateCurrencyDropdowns() {
        const rates = await fetchExchangeRates('USD');
        if (!rates) return;

        const currencies = Object.keys(rates);
        const sortedCurrencies = [
            ...commonCurrencies.filter(cur => currencies.includes(cur)),
            ...currencies.filter(cur => !commonCurrencies.includes(cur))
        ];

        const createOptions = (selectedValue) => {
            return sortedCurrencies.map(currency => `
                <option value="${currency}" ${currency === selectedValue ? 'selected' : ''}>
                    ${currency}
                </option>
            `).join('');
        };

        fromCurrency.innerHTML = createOptions('USD');
        toCurrency.innerHTML = createOptions('EUR');
    }

    async function updateConversion() {
        const from = fromCurrency.value;
        const to = toCurrency.value;
        const amountValue = parseFloat(amount.value);

        if (isNaN(amountValue) || amountValue <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

        try {
            const rates = await fetchExchangeRates(from);
            if (!rates) throw new Error('Failed to fetch exchange rates');

            const rate = rates[to];
            const converted = (amountValue * rate).toFixed(2);
            
            conversionText.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
            resultAmount.textContent = `${converted} ${to}`;
        } catch (error) {
            alert('Error converting currency. Please try again.');
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = 'Convert <i class="fas fa-sync-alt"></i>';
        }
    }

    // Event Listeners
    convertBtn.addEventListener('click', updateConversion);
    
    swapBtn.addEventListener('click', () => {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        updateConversion();
    });

    // Initialize
    populateCurrencyDropdowns();
});