let serialNo = localStorage.getItem('serialNo') ? parseInt(localStorage.getItem('serialNo')) : 1;
let currentEditSerialNo = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    loadLoans();
});

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

function addService() {
    const date = document.getElementById('service-date').value;
    const name = document.getElementById('service-name').value;
    const time = document.getElementById('service-time').value;
    const pricePerHour = parseFloat(document.getElementById('service-price').value);

    if (!validateTime(time) || isNaN(pricePerHour)) {
        alert('Please enter a valid time and price.');
        return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const totalAmount = ((hours * 60 + minutes) / 60) * pricePerHour;

    const table = document.getElementById('harvesting-table').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    row.innerHTML = `<td>${date}</td><td>${name}</td><td>${time}</td><td>${pricePerHour.toFixed(2)}</td><td>${totalAmount.toFixed(2)}</td><td><button onclick="removeService(this)">Remove</button></td>`;

    updateTotals();
}

function validateTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return Number.isInteger(hours) && hours >= 0 && hours < 24 && Number.isInteger(minutes) && minutes >= 0 && minutes < 60;
}

function removeService(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotals();
}

function updateTotals() {
    const rows = document.querySelectorAll('#harvesting-table tbody tr');
    let totalAmount = 0;

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        totalAmount += parseFloat(cells[4].innerText || 0);
    });

    document.getElementById('total-amount').innerText = totalAmount.toFixed(2);

    const advanceAmount = parseFloat(document.getElementById('advance-amount').value) || 0;
    const pendingAmount = totalAmount - advanceAmount;

    document.getElementById('pending-amount').innerText = pendingAmount.toFixed(2);
}

function saveCustomer() {
    const name = document.getElementById('customer-name').value;
    const mobile = document.getElementById('customer-mobile').value;
    const address = document.getElementById('customer-address').value;
    const totalAmount = document.getElementById('total-amount').innerText;
    const advanceAmount = document.getElementById('advance-amount').value;
    const pendingAmount = document.getElementById('pending-amount').innerText;

    if (!name || !mobile || !address) {
        alert('Please fill in all customer details.');
        return;
    }

    const services = [];
    const serviceRows = document.querySelectorAll('#harvesting-table tbody tr');
    serviceRows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const serviceDate = cells[0].innerText;
        const serviceName = cells[1].innerText;
        const serviceTime = cells[2].innerText;
        services.push({ date: serviceDate, name: serviceName, time: serviceTime });
    });

    const customerData = {
        serialNo: currentEditSerialNo !== null ? currentEditSerialNo : serialNo++,
        name,
        mobile,
        address,
        totalAmount,
        advanceAmount,
        pendingAmount,
        services
    };

    localStorage.setItem(`customer-${customerData.serialNo}`, JSON.stringify(customerData));
    localStorage.setItem('serialNo', serialNo);
    updateCustomerList(customerData);
    clearCustomerForm();
}

function updateCustomerList(customerData) {
    const registeredCustomersTable = document.getElementById('registered-customers').getElementsByTagName('tbody')[0];
    const row = registeredCustomersTable.insertRow();
    row.setAttribute('data-serialno', customerData.serialNo);
    row.innerHTML = `
        <td>${customerData.serialNo}</td>
        <td>${customerData.name}</td>
        <td>${customerData.mobile}</td>
        <td>${customerData.address}</td>
        <td>${customerData.pendingAmount}</td>
        <td>
            <button onclick="callCustomer('${customerData.mobile}')">Call</button>
            <button onclick="viewDetails(${customerData.serialNo})">Details</button>
            <button onclick="deleteCustomer(${customerData.serialNo})">Delete</button>
            <button onclick="editCustomer(${customerData.serialNo})">Update</button>
        </td>
    `;
}

function clearCustomerForm() {
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-mobile').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('advance-amount').value = '';
    document.getElementById('total-amount').innerText = '0';
    document.getElementById('pending-amount').innerText = '0';
    clearServiceTable();
}

function clearServiceTable() {
    const table = document.getElementById('harvesting-table').getElementsByTagName('tbody')[0];
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
}

function loadCustomers() {
    const registeredCustomersTable = document.getElementById('registered-customers').getElementsByTagName('tbody')[0];
    registeredCustomersTable.innerHTML = ''; // Clear existing rows

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('customer-')) {
            const customerData = JSON.parse(localStorage.getItem(key));
            updateCustomerList(customerData);
        }
    });
}

function searchCustomer() {
    const query = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#registered-customers tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let match = false;
        if (cells.length > 0) {
            match = Array.from(cells).some(cell => cell.innerText.toLowerCase().includes(query));
        }
        row.style.display = match ? '' : 'none';
    });
}

function callCustomer(mobile) {
    window.location.href = `tel:${mobile}`;
}

function viewDetails(serialNo) {
    const customerData = JSON.parse(localStorage.getItem(`customer-${serialNo}`));
    if (customerData) {
        const services = customerData.services.map(s => `${s.name} at ${s.time} on ${s.date}`).join('\n');
        alert(`Details for serial number ${serialNo}\nName: ${customerData.name}\nMobile: ${customerData.mobile}\nAddress: ${customerData.address}\nTotal Amount: ${customerData.totalAmount}\nAdvance Amount: ${customerData.advanceAmount}\nPending Amount: ${customerData.pendingAmount}\n\nServices:\n${services}`);
    } else {
        alert('No details found.');
    }
}

function deleteCustomer(serialNo) {
    if (confirm('Are you sure you want to delete this customer?')) {
        localStorage.removeItem(`customer-${serialNo}`);
        const row = document.querySelector(`#registered-customers tbody tr[data-serialno="${serialNo}"]`);
        if (row) {
            row.parentNode.removeChild(row);
        }
    }
}

function editCustomer(serialNo) {
    const customerData = JSON.parse(localStorage.getItem(`customer-${serialNo}`));
    if (customerData) {
        document.getElementById('customer-name').value = customerData.name;
        document.getElementById('customer-mobile').value = customerData.mobile;
        document.getElementById('customer-address').value = customerData.address;
        document.getElementById('advance-amount').value = customerData.advanceAmount;
        document.getElementById('total-amount').innerText = customerData.totalAmount;
        document.getElementById('pending-amount').innerText = customerData.pendingAmount;

        clearServiceTable();
        customerData.services.forEach(service => {
            document.getElementById('service-date').value = service.date;
            document.getElementById('service-name').value = service.name;
            document.getElementById('service-time').value = service.time;
            document.getElementById('service-price').value = '0'; // Temporary
            addService();
        });

        currentEditSerialNo = serialNo;
        showTab('register-customer');
    }
}

function updatePaymentsTab() {
    const paymentsTableBody = document.querySelector('#payments-table tbody');
    paymentsTableBody.innerHTML = ''; // Clear previous data

    let totalAmountAll = 0;
    let pendingAmountAll = 0;

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('customer-')) {
            const customerData =
            JSON.parse(localStorage.getItem(key));
            const row = paymentsTableBody.insertRow();
            row.innerHTML = `
                <td>${customerData.serialNo}</td>
                <td>${customerData.name}</td>
                <td>${customerData.totalAmount}</td>
                <td>${customerData.pendingAmount}</td>
            `;

            totalAmountAll += parseFloat(customerData.totalAmount);
            pendingAmountAll += parseFloat(customerData.pendingAmount);
        }
    });

    document.getElementById('total-amount-all').innerText = totalAmountAll.toFixed(2);
    document.getElementById('pending-amount-all').innerText = pendingAmountAll.toFixed(2);
}

document.querySelectorAll('.tabs button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.textContent === 'Payments') {
            updatePaymentsTab();
        }
    });
});

function addLoan() {
    const date = document.getElementById('loan-date').value;
    const loanFrom = document.getElementById('loan-from').value;
    const amount = parseFloat(document.getElementById('loan-amount').value);

    if (!date || !loanFrom || isNaN(amount)) {
        alert('Please enter valid loan details.');
        return;
    }

    const table = document.getElementById('loans-table').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    row.innerHTML = `
        <td>${date}</td>
        <td>${loanFrom}</td>
        <td>${amount.toFixed(2)}</td>
        <td><button onclick="removeLoan(this)">Delete</button></td>
    `;

    updateTotalLoanAmount();
}

function removeLoan(button) {
    button.closest('tr').remove();
    updateTotalLoanAmount();
}

function updateTotalLoanAmount() {
    const rows = document.querySelectorAll('#loans-table tbody tr');
    let totalAmount = 0;

    rows.forEach(row => {
        const amount = parseFloat(row.cells[2].textContent) || 0;
        totalAmount += amount;
    });

    document.getElementById('total-loan-amount').textContent = totalAmount.toFixed(2);
}

function saveLoans() {
    const loans = Array.from(document.querySelectorAll('#loans-table tbody tr')).map(row => {
        const cells = row.getElementsByTagName('td');
        const date = cells[0].textContent;
        const loanFrom = cells[1].textContent;
        const amount = parseFloat(cells[2].textContent);
        return { date, loanFrom, amount };
    });

    localStorage.setItem('loans', JSON.stringify(loans));
    alert('Loans saved successfully!');
}

function loadLoans() {
    const savedLoans = JSON.parse(localStorage.getItem('loans')) || [];
    const table = document.getElementById('loans-table').getElementsByTagName('tbody')[0];

    savedLoans.forEach(loan => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${loan.date}</td>
            <td>${loan.loanFrom}</td>
            <td>${loan.amount.toFixed(2)}</td>
            <td><button onclick="removeLoan(this)">Delete</button></td>
        `;
    });

    updateTotalLoanAmount();
}

document.querySelectorAll('.tabs button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.textContent === 'Loans') {
            loadLoans();
        }
    });
});
function updatePaymentsTab() {
    const paymentsTableBody = document.querySelector('#payments-table tbody');
    paymentsTableBody.innerHTML = ''; // Clear previous data

    let totalAmountAll = 0;
    let pendingAmountAll = 0;

    // Iterate through all customers in local storage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('customer-')) {
            const customerData = JSON.parse(localStorage.getItem(key));
            const row = paymentsTableBody.insertRow();
            row.innerHTML = `
                <td>${customerData.serialNo}</td>
                <td>${customerData.name}</td>
                <td>${customerData.totalAmount}</td>
                <td>${customerData.pendingAmount}</td>
                <td><button onclick="removePayment(${customerData.serialNo})">Remove</button></td> <!-- Remove button -->
            `;

            // Update totals
            totalAmountAll += parseFloat(customerData.totalAmount);
            pendingAmountAll += parseFloat(customerData.pendingAmount);
        }
    });

    // Update summary section
    document.getElementById('total-amount-all').innerText = totalAmountAll.toFixed(2);
    document.getElementById('pending-amount-all').innerText = pendingAmountAll.toFixed(2);
}

function removePayment(serialNo) {
    if (confirm('Are you sure you want to remove this payment?')) {
        localStorage.removeItem(`customer-${serialNo}`);
        updatePaymentsTab(); // Refresh the payments tab to reflect changes
    }
}
// Add these functions to your existing script.js

function showExpenseTab(tabId) {
    document.querySelectorAll('.expense-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

function addExpense(tabNumber) {
    const date = document.getElementById(`expense-date-${tabNumber}`).value;
    const purpose = document.getElementById(`expense-purpose-${tabNumber}`).value;
    const received = document.getElementById(`expense-received-${tabNumber}`).value;
    const amount = parseFloat(document.getElementById(`expense-amount-${tabNumber}`).value);

    if (!date || !purpose || isNaN(amount)) {
        alert('Please enter valid expense details.');
        return;
    }

    // Add row to the corresponding expense table
    const tableBody = document.getElementById(`expense-table-${tabNumber}`);
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${date}</td>
        <td>${purpose}</td>
        <td>${received}</td>
        <td>${amount.toFixed(2)}</td>
        <td><button onclick="removeExpense(this, ${tabNumber})">Remove</button></td>
    `;

    updateTotalExpense(tabNumber);
    clearExpenseInputs(tabNumber);
}

function removeExpense(button, tabNumber) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);
    updateTotalExpense(tabNumber);
}

function updateTotalExpense(tabNumber) {
    const rows = document.querySelectorAll(`#expense-table-${tabNumber} tr`);
    let total = 0;

    rows.forEach(row => {
        const amountCell = row.cells[3];
        total += parseFloat(amountCell.innerText) || 0;
    });

    document.getElementById(`total-expense-${tabNumber}`).innerText = total.toFixed(2);
}

function clearExpenseInputs(tabNumber) {
    document.getElementById(`expense-date-${tabNumber}`).value = '';
    document.getElementById(`expense-purpose-${tabNumber}`).value = '';
    document.getElementById(`expense-received-${tabNumber}`).value = '';
    document.getElementById(`expense-amount-${tabNumber}`).value = '';
}

// Initialize default tab for expenses
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    loadLoans();
    showExpenseTab('expense-1'); // Show first expense tab by default
});
