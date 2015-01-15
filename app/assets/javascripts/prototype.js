/**
 * Created by nmiddleweek on 21/12/2014.
 */


(function () {

    $('.js-tabs').click('a', function (evt) {
        var link = $(evt.target);
        var listItem = link.parent('li');
        var tabID = link.attr('id');
        var panelID = tabID + '-panel';

        $('.js-tabs li').removeClass('active');
        listItem.addClass('active');

        $('.tab-content .tab-pane').removeClass('tabs-panel-selected');

        $('#' + panelID).addClass('tabs-panel-selected');

        switch (tabID) {
            case 'tab-accounts':
            {
                initTabAccounts();
                break;
            }
        }

    });

    $('.accounts-panel-add .button').click(function (evt) {
        openAccountInput();
        $('.accounts-panel-add').removeClass('open');
    });

    var model = {
            'accounts': [],
            'types': [
                {
                    'name': 'Please select',
                    'categories': [
                        'Please select'
                    ]
                },
                {
                    'name': 'Benefits',
                    'categories': [
                        'Please select',
                        'Disability Living Allowance',
                        'Attendance Allowance',
                        'Employment Support Allowance',
                        'Incapacity Benefit',
                        'Severe Disablement Allowance',
                        'Income Support/Pension Credit',
                        'Housing Benefit',
                        'State Pension'
                    ]
                },
                {
                    'name': 'Income',
                    'categories': [
                        'Please select',
                        'Occupational pension(s)',
                        'Account interest',
                        'Income from investments/property',
                        'Sale of investments/property/assets',
                        'Transfers from other accounts/Court Funds',
                        'Tax rebates/other refunds',
                        'Bequests (e.g. inheritance, gifts received'
                    ]},
                {
                    'name': 'Expenditure',
                    'categories': [
                        'Please select',
                        'Accommodation costs (e.g. rent, mortgage)',
                        'Care fees/Local Authority charges for care',
                        'Household bills (e.g. water, gas, electric, TV, Phone, Internet',
                        'Tax',
                        'Insurance',
                        'Office of the Public Guardian fees',
                        'Deputy’s security bond premium',
                        'Capital expenditure/major purchases',
                        'Property maintenance/improvement',
                        'Investments purchased',
                        'Transfers to other accounts/ Court Funds',
                        'Holidays/excursions',
                        'Professional fees',
                        'Deputy’s expenses',
                        'Spending money provided for Client',
                        'Day-to-day living costs (e.g. Food, Toiletries, Sundries)',
                        'Gifts'
                    ]}
            ]
        },
        account = {},
        uuidCounter = 0,
        initTabAccounts = function initTabAccounts() {

            $('.accounts-panel').removeClass('open');

            if (model.accounts.length === 0) {
                // Then show the first entry input

                var template = document.getElementById('accounts-panel-input-1-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                    output = Mustache.render(template,
                        {
                            'name': '',
                            'number5': '',
                            'number6': '',
                            'number7': '',
                            'number8': '',
                            'sortCode1': '',
                            'sortCode2': '',
                            'sortCode3': '',
                            'dateDay': '',
                            'dateMonth': '',
                            'dateYear': '',
                            'openingBalance': ''

                        });
                $('.accounts-panel-input-1').html(output);

                $('.accounts-panel-input-1').addClass('open');
                $('.accounts-panel-default-header').addClass('open');

                $('.js-save-account').click(function (evt) {
                    saveAccounts();
                });

            } else {
                // Draw the accounts list

                showAccountListing();

            }

        },
        saveAccounts = function saveAccounts(close) {

            account = {
                'name': $('#account_bank_name').val(),
                'number5': $('#account_bank_num-5th').val(),
                'number6': $('#account_bank_num-6th').val(),
                'number7': $('#account_bank_num-7th').val(),
                'number8': $('#account_bank_num-8th').val(),
                'sortCode1': $('#account_bank_sort-code-1').val(),
                'sortCode2': $('#account_bank_sort-code-2').val(),
                'sortCode3': $('#account_bank_sort-code-3').val(),
                'dateDay': $('#account_bank_date-day').val(),
                'dateMonth': $('#account_bank_date-month').val(),
                'dateYear': $('#account_bank_date-year').val(),
                'number': $('#account_bank_num-5th').val() + $('#account_bank_num-6th').val() + $('#account_bank_num-7th').val() + $('#account_bank_num-8th').val(),
                'sortCode': $('#account_bank_sort-code-1').val() + '-' + $('#account_bank_sort-code-2').val() + '-' + $('#account_bank_sort-code-3').val(),
                'startDate': new Date($('#account_bank_date-day').val(), $('#account_bank_date-month').val() - 1, $('#account_bank_date-year').val()),
                'openingBalance': $('#account_bank_total').val()
            };

            if (close === true) {
                // existing record
                account.uuid = $(this.currentTarget).parents('tr.accounts-panel-edit').data('uuid');
                var elem = findIndexAccount(account.uuid);
                account.transactions = model.accounts[elem].transactions;
                model.accounts[elem] = account;
                $(this.currentTarget).parents('tr.accounts-panel-edit').removeClass('open');

                showAccountListing();
            }
            else {
                // new record
                account.uuid = ++uuidCounter;
                model.accounts[model.accounts.length] = account;
                openAccountsPageTwo();
            }

            //closeAccountInput();
            //refreshAccountListing();

        },
        openAccountsPageTwo = function openAccountsPageTwo() {
            $('.accounts-panel').removeClass('open');

            var template = document.getElementById('accounts-panel-input-2-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template, account);

            $('.accounts-panel-input-1').html('');
            $('.accounts-panel-input-2').html(output).addClass('open');

            $('#transaction_type')
                .html(buildTypes())
                .change(function (evt) {
                    $('#transaction_category').html(buildCategories($('#transaction_type option:selected').val()));
                });
            $('#transaction_category').html(buildCategories($('#transaction_type option:selected').val()));

            if ((account.transactions) && (account.transactions.length > 0)) {
                refreshTransactionsList();
            }

            updateCurrentBalance();


            $('.js-clear-transaction').click(function (evt) {
                clearTransactionInput();
            });

            $('.js-breadcrumb-accounts').click(function () {
                initTabAccounts();
            });

            $('.js-add-transaction').click(function (evt) {
                if (!account.transactions) {
                    account.transactions = [];
                }


                var amount = $('#transaction_amount').val(),
                    transaction = {
                        'uuid': ++uuidCounter,
                        'jsDate': new Date($('#transaction_date-year').val(), $('#transaction_date-month').val() - 1, $('#transaction_date-day').val()),
                        'date': $('#transaction_date-day').val() + '/' + $('#transaction_date-month').val() + '/' + $('#transaction_date-year').val(),
                        'dateDay': $('#transaction_date-day').val(),
                        'dateMonth': $('#transaction_date-month').val(),
                        'dateYear': $('#transaction_date-year').val(),
                        'typeValue': $('#transaction_type option:selected').val(),
                        'type': $('#transaction_type option:selected').text(),
                        'categoryValue': $('#transaction_category option:selected').val(),
                        'category': $('#transaction_category option:selected').text(),
                        'amount': amount,
                        'moneyIn': (parseFloat(amount) >= 0 ? amount : ''),
                        'moneyOut': (parseFloat(amount) < 0 ? amount : '')
                    };

                account.transactions.splice(0, 0, transaction);

                flushAccountData(); // This saves the account and transactions data.

                refreshTransactionsList();

                updateCurrentBalance();

                clearTransactionInput();

            });

        },
        flushAccountData = function flushAccountData() {
            var uuid = account.uuid,
                elem = findIndexAccount(uuid);

            model.accounts[elem] = account;

        },
        refreshTransactionsList = function refreshTransactionsList() {
            var template = document.getElementById('accounts-panel-input-2__transactions-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template, {records: account.transactions});

            $('.accounts-panel-input-2__transactions tbody').html(output);

            $('.js-edit-transaction').click(function (evt) {
                editTransaction(evt.currentTarget);
            });

        },
        editTransaction = function editTransaction(linkTarget) {
            var uuid = $(linkTarget).parents('tr').data('uuid'),
                transaction = lookUpTransaction(account, uuid),
                template = document.getElementById('accounts-panel-input-2__transactions-edit-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template, transaction),
                loop;

            if ($('.accounts-panel-edit-transaction').length > 0) {
                return; // early return
            }

            $(linkTarget).parents('tr').after("<tr class=\"accounts-panel-edit-transaction\" data-uuid=\"" + uuid + "\"><td colspan=\"5\">" + output + "</td></tr>");
            $('.accounts-panel-edit-transaction .accounts-panel').addClass('open');

            $('#edit-transaction_type')
                .html(buildTypes())
                .change(function (evt) {
                    $('#edit-transaction_category').html(buildCategories($('#edit-transaction_type option:selected').val()));
                });

            for (loop = 0; loop < $('#edit-transaction_type')[0].options.length; loop++) {
                if ($('#edit-transaction_type option').eq(loop).val() === transaction.typeValue) {
                    $('#edit-transaction_type option').eq(loop).attr('selected', 'selected')
                }
            }

            $('#edit-transaction_category').html(buildCategories(   $('#edit-transaction_type option:selected').val()   ));
            for (loop = 0; loop < $('#edit-transaction_category')[0].options.length; loop++) {
                if ($('#edit-transaction_category option').eq(loop).val() === transaction.categoryValue) {
                    $('#edit-transaction_category option').eq(loop).attr('selected', 'selected')
                }
            }


            $('.js-save-transaction').click(function (evt) {

                var amount = $('#edit-transaction_amount').val(),
                    transaction = {
                        'uuid': uuid,
                        'jsDate': new Date($('#edit-transaction_date-year').val(), $('#edit-transaction_date-month').val() - 1, $('#edit-transaction_date-day').val()),
                        'date': $('#edit-transaction_date-day').val() + '/' + $('#edit-transaction_date-month').val() + '/' + $('#edit-transaction_date-year').val(),
                        'dateDay': $('#edit-transaction_date-day').val(),
                        'dateMonth': $('#edit-transaction_date-month').val(),
                        'dateYear': $('#edit-transaction_date-year').val(),
                        'typeValue': $('#edit-transaction_type option:selected').val(),
                        'type': $('#edit-transaction_type option:selected').text(),
                        'categoryValue': $('#edit-transaction_category option:selected').val(),
                        'category': $('#edit-transaction_category option:selected').text(),
                        'amount': amount,
                        'moneyIn': (parseFloat(amount) >= 0 ? amount : ''),
                        'moneyOut': (parseFloat(amount) < 0 ? amount : '')
                    },
                    elem = findIndexTransaction(account, uuid);

                account.transactions[elem] = transaction;

                flushAccountData();
                refreshTransactionsList();

                $('.accounts-panel-edit-transaction .accounts-panel-input-2__entry-form').removeClass('open');

                $('.accounts-panel-edit-transaction').remove();

            });

            $('.js-cancel-transaction').click(function (evt) {
                $('.accounts-panel-edit-transaction .accounts-panel-input-2__entry-form').removeClass('open');
                $('.accounts-panel-edit-transaction').remove();

            });


        },
        clearTransactionInput = function clearTransactionInput() {

            $('#transaction_date-day').val('');
            $('#transaction_date-month').val('');
            $('#transaction_date-year').val('');

            $('#transaction_type').val(0);
            $('#transaction_category').val(0);

            $('#transaction_amount').val('');

        },
        closeAccountInput = function closeAccountInput() {
            $('.accounts-panel-input').removeClass('open');
        },
        openAccountInput = function openAccountInput() {
            var template = document.getElementById('accounts-panel-input-1-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template,
                    {
                        'name': '',
                        'number5': '',
                        'number6': '',
                        'number7': '',
                        'number8': '',
                        'sortCode1': '',
                        'sortCode2': '',
                        'sortCode3': '',
                        'dateDay': '',
                        'dateMonth': '',
                        'dateYear': '',
                        'openingBalance': ''
                    });

            $('.accounts-panel-input-1').html(output);

            $('.js-save-account').click(function (evt) {
                saveAccounts();
            });

            $('.accounts-panel-input-1').addClass('open');
        },
        showAccountListing = function showAccountListing() {
            var template = document.getElementById('accounts-table-list-item').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template, {records: model.accounts});

            $('.accounts-table-listing').html(output);

            $('.accounts-panel-listing-header').addClass('open');
            $('.accounts-panel-add').addClass('open');
            $('.accounts-panel-listing').addClass('open');

            $('.js-edit-account').click(function (evt) {
                editAccountDetails(evt.currentTarget);
            });

            $('.js-open-account').click(function (evt) {
                openAccountDetails(evt.currentTarget);
            });

        },
        openAccountDetails = function openAccountDetails(linkTarget) {
            var uuid = $(linkTarget).parents('tr').data('uuid');

            account = lookUpAccount(uuid);

            openAccountsPageTwo();


        },
        editAccountDetails = function editAccountDetails(linkTarget) {
            var uuid = $(linkTarget).parents('tr').data('uuid'),
                account = lookUpAccount(uuid),
                template = document.getElementById('accounts-panel-input-1-template').innerHTML.replace(/<%/g, '{{').replace(/%>/g, '}}'),
                output = Mustache.render(template, account);

            $(linkTarget).parents('tr').after("<tr class=\"accounts-panel-edit\" data-uuid=\"" + uuid + "\"><td colspan=\"4\">" + output + "</td></tr>");
            $('.accounts-panel-edit').addClass('open');

            $('.js-add-edit-label').html('Edit');
            $('.js-save-account').val('Save');

            $('.js-save-account').click(function (evt) {
                saveAccounts.call(evt, true);
            });

        },
        findIndexAccount = function findIndexAccount(uuid) {
            var loop, elem = -1;

            for (loop = 0; loop < model.accounts.length; loop++) {
                if (model.accounts[loop].uuid === uuid) {
                    elem = loop;
                    break;
                }
            }
            return elem;
        },
        lookUpAccount = function lookUpAccount(uuid) {
            var loop, record = null;

            for (loop = 0; loop < model.accounts.length; loop++) {
                if (model.accounts[loop].uuid === uuid) {
                    record = model.accounts[loop];
                    break;
                }
            }
            return record;

        },
        lookUpTransaction = function lookUpTransaction(account, uuid) {
            var loop, record = null;

            for (loop = 0; loop < account.transactions.length; loop++) {
                if (account.transactions[loop].uuid === uuid) {
                    record = account.transactions[loop];
                    break;
                }
            }
            return record;

        },
        findIndexTransaction = function findIndexTransaction(account, uuid) {
            var loop, elem = -1;

            for (loop = 0; loop < account.transactions.length; loop++) {
                if (account.transactions[loop].uuid === uuid) {
                    elem = loop;
                    break;
                }
            }
            return elem;
        },
        createUUID = function createUUID() {
            // http://www.ietf.org/rfc/rfc4122.txt
            var s = [],
                hexDigits = '0123456789abcdef',
                i,
                uuid;
            for (i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = '-';

            uuid = s.join('');

            return uuid;

        },
        updateCurrentBalance = function updateCurrentBalance() {
            var balance = parseFloat(account.openingBalance),
                loop;

            if (account.transactions) {
                for (loop = 0; loop < account.transactions.length; loop++) {
                    balance = balance + parseFloat(account.transactions[loop].amount);
                }
            }

            $('.js-current-balance').html('£' + balance.toFixed(2));

        },
        buildTypes = function buildTypes() {
            var optionHTML = '',
                loop;

            for (loop = 0; loop < model.types.length; loop++) {
                optionHTML += '<option value="' + loop + '">' + model.types[loop].name + '</option>>';
            }

            return optionHTML;

        },
        buildCategories = function buildCategories(typeElem) {
            var optionHTML = '',
                loop,
                type = model.types[typeElem];

            for (loop = 0; loop < type.categories.length; loop++) {
                optionHTML += '<option value="' + loop + '">' + type.categories[loop] + '</option>>';
            }

            return optionHTML;
        };
})
();

