let resultsDiv;

document.getElementById('generateForms').addEventListener('click', function() {
  const formContainer = document.getElementById('formContainer');
  const numForms = parseInt(document.getElementById('numForms').value);

  // Clear existing forms
  formContainer.innerHTML = '';

  if (isNaN(numForms) || numForms < 2) {
    alert('Must enter at least 2 players.');
    return;
  }

  // Generate specified number of forms
  for (let i = 1; i <= numForms; i++) {
    const formDiv = document.createElement('div');
    formDiv.className = 'dynamic-form';
    formDiv.style = 'padding: 5px; margin-bottom: 10px';

    const label = document.createElement('label');
    label.textContent = `Player ${i}:`;
    label.setAttribute('for', `formInput${i}`);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = `formInput${i}`;
    nameInput.name = `playerName${i}`;
    nameInput.placeholder = "Name";
    nameInput.className = 'form-control mb-2';

    const buyIn = document.createElement('input');
    buyIn.type = 'number';
    buyIn.id = `buyIn${i}`;
    buyIn.name = `buyIn${i}`;
    buyIn.placeholder = "Buy-in for";
    buyIn.className = 'form-control mb-2';


    const moneyEarned = document.createElement('input');
    moneyEarned.type = 'number';
    moneyEarned.id = `moneyEarned${i}`;
    moneyEarned.name = `moneyEarned${i}`;
    moneyEarned.placeholder = "Money Earned";
    moneyEarned.className = 'form-control mb-2';


    formDiv.appendChild(label);
    formDiv.appendChild(nameInput);
    formDiv.appendChild(buyIn);
    formDiv.appendChild(moneyEarned);
    formContainer.appendChild(formDiv);
  }

  // Add submit button


  class Player {
    constructor(name, buyIn, moneyEarned) {
      this.name = name;
      this.buyIn = buyIn;
      this.moneyEarned = moneyEarned;
      this.balance = moneyEarned - buyIn;
    }
  }

  class Transaction {
    constructor(from, to, amount) {
      this.from = from;
      this.to = to;
      this.amount = amount;
    }
  }

  function calculateDebts(players) {
    // Categorize players
    const winners = players.filter(p => p.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const losers = players.filter(p => p.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    const breakeven = players.filter(p => p.balance === 0);

    const transactions = [];
    let wi = 0; // winner index
    let li = 0; // loser index

    while (wi < winners.length && li < losers.length) {
      const winner = winners[wi];
      const loser = losers[li];

      const debt = Math.min(
        Math.abs(winner.balance),
        Math.abs(loser.balance)
      );

      transactions.push(new Transaction(
        loser.name,
        winner.name,
        Number(debt.toFixed(2))
      ));

      // Update balances
      winner.balance -= debt;
      loser.balance += debt;

      // Move to next winner/loser if current balance is settled
      if (winner.balance <= 0.01) wi++; // Account for floating point precision
      if (loser.balance >= -0.01) li++;
    }

    return {
      winners: winners.map(p => ({
        name: p.name,
        owed: p.moneyEarned - p.buyIn
      })),
      losers: losers.map(p => ({
        name: p.name,
        owes: p.buyIn - p.moneyEarned
      })),
      breakeven: breakeven.map(p => p.name),
      transactions
    };
  }

  // Add a button to submit the form data
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Player Data';
  // Inside the submitButton.onclick function:
  submitButton.onclick = function() {

    submitButton.className = 'btn btn-primary mt-3';

    const players = [];
    let totalBuyIn = 0;
    let totalMoneyEarned = 0;

    for (let i = 1; i <= numForms; i++) {
      const name = document.getElementById(`formInput${i}`).value;
      const buyInValue = parseFloat(document.getElementById(`buyIn${i}`).value);
      const moneyEarnedValue = parseFloat(document.getElementById(`moneyEarned${i}`).value);

      if (name && !isNaN(buyInValue) && !isNaN(moneyEarnedValue)) {
        const player = {
          name: name,
          buyIn: buyInValue,
          moneyEarned: moneyEarnedValue
        };
        players.push(player);

        // Add to totals
        totalBuyIn += buyInValue;
        totalMoneyEarned += moneyEarnedValue;
      } else {
        alert(`Please fill in all fields for Player ${i}.`);
        return;
      }
    }

    // Check if totals match
    if (totalBuyIn.toFixed(2) !== totalMoneyEarned.toFixed(2)) {
      alert(`Error: Total Buy-In ($${totalBuyIn.toFixed(2)}) ≠ Total Money Earned ($${totalMoneyEarned.toFixed(2)})`);
      return;
    }

    for (let i = 1; i <= numForms; i++) {
      players.push(new Player(
        document.getElementById(`formInput${i}`).value,
        parseFloat(document.getElementById(`buyIn${i}`).value),
        parseFloat(document.getElementById(`moneyEarned${i}`).value)
      ));
    }

    const result = calculateDebts(players);
    console.log("Debt Calculation Result:", result);

    // Display results
    const resultsDiv = document.createElement('div');
    resultsDiv.innerHTML = `
    <h3>Debt Settlement Plan</h3>
    ${formatResults(result)}
  `;
    formContainer.appendChild(resultsDiv);
  };

  function formatResults(result) {
    let html = `<h4>Transactions needed:</h4>`;

    if (result.transactions.length === 0) {
      html += `<p>No transactions needed - everyone breaks even!</p>`;
    } else {
      html += `<ul>`;
      result.transactions.forEach(t => {
        html += `<li>${t.from} owes ${t.to} $${t.amount.toFixed(2)}</li>`;
      });
      html += `</ul>`;
    }

    html += `<h4>Summary:</h4>
          <p>Winners: ${result.winners.map(w => `${w.name} ($${w.owed.toFixed(2)})`).join(', ')}</p>
          <p>Losers: ${result.losers.map(l => `${l.name} ($${l.owes.toFixed(2)})`).join(', ')}</p>
          <p>Breakeven: ${result.breakeven.join(', ') || 'None'}</p>`;

    return html;


    console.log("Players Array:", players);
    console.log("Total Buy-In:", totalBuyIn);
    console.log("Total Money Earned:", totalMoneyEarned);

    // Optional: Display totals on the page
    const totalsContainer = document.createElement('div');
    totalsContainer.innerHTML = `
    <h3>Totals:</h3>
    <p>Total Buy-In: $${totalBuyIn.toFixed(2)}</p>
    <p>Total Money Earned: $${totalMoneyEarned.toFixed(2)}</p>
  `;
    const playerContainer = document.createElement('div');
    totalsContainer.innerHTML = `

    `

    formContainer.appendChild(totalsContainer);
  };

  formContainer.appendChild(submitButton);

});

