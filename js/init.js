console.log(ripple);
var api = new ripple.RippleAPI({
  server: 'wss://s1.ripple.com/'
});

printingCSS = new String('<link href="css/printing.css" rel="stylesheet" type="text/css">')

function printWallet(side) {
  window.frames["print_frame"].document.body.innerHTML = printingCSS + document.getElementById(side).outerHTML;
  window.frames["print_frame"].window.focus();
  setTimeout(function () {
    window.frames["print_frame"].window.print();
  }, 1000);
}

(function ($) {

  /**
   * config
   */
  var config = config || {};

  config.wallets = {
    'tip': '',
    'new': ''
  };

  config.xrplCurrentTransactionCost = undefined;

  /**
   * set current account using an hardcoded
   */
  var account = config.wallets.new;

  function displayAccountStatus(status) {
    // TODO::LGCARRIER
    // inject the account status into the page
  }

  /**
   * validateAccountStatus
   */
  function validateAccountStatus(account) {
    api.connect().then(() => {
      return api.getBalances(account);
    }).then(balances => { }).then(() => {
      displayAccountStatus('Account validated');
    }).catch((error) => {
      if (error.name == 'RippledError' && error.message == 'actNotFound') {
        displayAccountStatus('Account not validated');
      }
    });
  }

  /**
   * displayAccountBalances
   */
  function displayAccountBalances(balances) {
    var mybalances = $('<ul></ul>').addClass('collection');
    // mybalances.append('<li class="collection-header"><h4>balances</h4></li>');

    _.each(balances, function (balance) {
      mybalances.append('<li class="collection-item">' + balance.currency + ':&nbsp;' + balance.value + '</li>')
    });

    mybalances.appendTo('#AccountBalances');
  }

  /**
   * getAccountBalances
   */
  function getAccountBalances(account) {
    api.connect().then(() => {
      console.log('getting balances for', account);
      return api.getBalances(account);
    }).then(balances => {
      console.log(balances);
      displayAccountBalances(balances);

      console.log('getBalances done');
    }).then(() => {
      // return api.disconnect();
    }).then(() => {
      // console.log('done and disconnected.');
    }).catch(console.error);
  }

  /**
   * init the visual theme
   */
  function initTheme() {
    // $('.button-collapse').sideNav();
    $('.parallax').parallax();
  }

  function bindEvents() {
    $('#generate-paper-wallet').click(function () {
      generatePaperWallet();
    });
  }

  function updateCurrentTransactionCost() {
    api.connect().then(() => {
      api.getFee().then(fee => {
        config.xrplCurrentTransactionCost = fee;
        $('#current-transaction-cost').text(fee + ` XRP (${api.xrpToDrops(fee)} drops)`);
      });
    }).then(() => {
      // return api.disconnect();
    }).then(() => {
      // console.log('done and disconnected.');
    }).catch(console.error);
  }

  function thousands_separators(num)
  {
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }

  function printCurrencyIssuerAccountInfoSettings(currency, pos) {
    var currencyIssuerAccountInfoSettings = {
      currency: currency
    };

    api.connect().then(() => {
      return api.getAccountInfo(currency.issuer);
    }).then(info => {
      currencyIssuerAccountInfoSettings.info = info;
      return api.getSettings(currency.issuer);
    }).then((settings) => {
      currencyIssuerAccountInfoSettings.settings = settings;
      return api.getAccountObjects(currency.issuer);
    }).then((objects) => {
      currencyIssuerAccountInfoSettings.objects = objects;
    }).then(() => {
      console.log(pos+1, currencyIssuerAccountInfoSettings);
      var topCurrenciesListRoot = $('#top-currencies-list');

      // var blackListedIssuers = [];

      $.get("https://data.ripple.com/v2/currencies/"+currency.currency+".svg",'',null,'text').then((svg) => {
      // var svgcontainer = document.createElement('div');
        // svgcontainer.innerHTML = svg;


        // topCurrenciesListRoot.append(svgcontainer.innerHTML);
        topCurrenciesListRoot.append(
          `<li class="collection-item avatar">
            <i class="material-icons circle">account_balance</i>
            <span class="title">#${pos+1} ${currency.currency} <span class="currency-symbol">${svg}</span> by ${currencyIssuerAccountInfoSettings.settings.domain || 'an unknown issuer'}</span>
            <p>
            ${currencyIssuerAccountInfoSettings.info.xrpBalance} XRP (${api.xrpToDrops(currencyIssuerAccountInfoSettings.info.xrpBalance)} drops <i class="fas fa-arrow-right"></i> potential transactions ${thousands_separators(currencyIssuerAccountInfoSettings.info.xrpBalance/config.xrplCurrentTransactionCost)})
                  <br/>
              <a href="https://bithomp.com/explorer/${currency.issuer}">bithomp</a>
              <a href="https://xrpscan.com/account/${currency.issuer}">xrpscan</a>
              <a href="https://api.xrpscan.com/api/v1/flare/snapshot/${currency.issuer}">sparkClaim</a>
            </p>
          </li>
          `
        );
      });

      
    }).then(() => {
      //return api.disconnect();
    }).then(() => {
      // console.log('done and disconnected.');
    }).catch(console.error);
  }

  function updateTopCurrencies() {
    $.getJSON("https://data.ripple.com/v2/network/top_currencies/").then((a) => {
      if (a.currencies) {
        a.currencies.forEach((currency, i) => {
          printCurrencyIssuerAccountInfoSettings(currency, i);
        });
      }
    });
  }

  $(function () {
    initTheme();
    bindEvents();

    updateCurrentTransactionCost();

    updateTopCurrencies();

    // getAccountBalances(account);

    // api.connect().then(function () {
    //   return api.getServerInfo();
    // }).then(function (server_info) {
    //   document.body.innerHTML += "<p>Connected to rippled server!</p>" +
    //     "      <table>" +
    //     "        <tr><th>Version</th>" +
    //     "          <td>" + server_info.buildVersion + "</td></tr>" +
    //     "        <tr><th>Ledgers available</th>" +
    //     "          <td>" + server_info.completeLedgers + "</td></tr>" +
    //     "        <tr><th>hostID</th>" +
    //     "          <td>" + server_info.hostID + "</td></tr>" +
    //     "        <tr><th>Most Recent Validated Ledger Seq.</th>" +
    //     "          <td>" + server_info.validatedLedger.ledgerVersion + "</td></tr>" +
    //     "        <tr><th>Most Recent Validated Ledger Hash</th>" +
    //     "          <td>" + server_info.validatedLedger.hash + "</td></tr>" +
    //     "        <tr><th>Seconds since last ledger validated</th>" +
    //     "          <td>" + server_info.validatedLedger.age + "</td></tr>" +
    //     "      </table>";
    // });

    // api.connect().then(() => {
    //   console.log('getting account info for', account);
    //   return api.getAccountInfo(account);
    // }).then(info => {
    //   console.log(info);
    //   document.body.innerHTML += info.xrpBalance;
    //   console.log('getAccountInfo done');
    // }).then(() => {
    //   // return api.disconnect();
    // }).then(() => {
    //   // console.log('done and disconnected.');
    // }).catch(console.error);

  }); // end of document ready
})(jQuery); // end of jQuery name space