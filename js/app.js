// BUDGET CONTROLLER
const budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome !== 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = 100;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    }
    
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            let newItem, ID;
            //create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }  else {
                ID = 0;
            }
            
            // create new item, expense or income
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            // push new item into array
            data.allItems[type].push(newItem);
            // return element
            return newItem;
        },
        deleteItem: function(type, id) {
            let ids = data.allItems[type].map(function(item) {
                return item.id;
            });
            let index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            // calc total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            //calcu budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calc percentage of income spent
            if (data.totals.inc === 0) {
                data.percentage = 100;
            } else {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(item) {
                item.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function()  {
            let allPerc = data.allItems.exp.map(function(item) {
                return item.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
const uiController = (function() {
    //DOM selectors
    let DOMSelectors = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };
    let formatNumber = function(num, type) {
        //format output number for UI
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        let int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3)+ "," + int.substr(int.length - 3, 3);
        }
        let dec = numSplit[1];
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };
    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // public function
    return {
        getInput: function() {
            //return values as an obj
            return {
                // read data from input
                type: document.querySelector(DOMSelectors.inputType).value,
                description: document.querySelector(DOMSelectors.inputDescription).value,
                value: parseFloat(document.querySelector(DOMSelectors.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            // create html string with placeholder text
            let html, newHtml, element;
            if (type === "inc") {
                element = DOMSelectors.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMSelectors.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields = document.querySelectorAll(DOMSelectors.inputDescription + ", " + DOMSelectors.inputValue);

            let fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(item) {
                item.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {

            let type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMSelectors.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMSelectors.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMSelectors.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
            document.querySelector(DOMSelectors.percentageLabel).textContent = obj.percentage + "%";
        },
        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMSelectors.expensesPercLabel);

            nodeListForEach(fields, function(item, index) {
                if (percentages[index] > 0) {
                    item.textContent = percentages[index] + "%";
                } else {
                    item.textContent = "--";
                }
            })
        },
        displayMonth: function() {
            let now = new Date();
            let months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
            let month = now.getMonth();
            let year = now.getFullYear();
            document.querySelector(DOMSelectors.dateLabel).textContent = months[month] + " " + year;
        },
        changedType: function () {
            let fields = document.querySelectorAll(
            DOMSelectors.inputType + ", " +
            DOMSelectors.inputDescription + ", " +
            DOMSelectors.inputValue);

            nodeListForEach(fields, function(item) {
                item.classList.toggle("red-focus");
            });
            document.querySelector(DOMSelectors.inputBtn).classList.toggle("red");
        },

        getDOMSelectors: function() {
            return  {
                DOMSelectors
            }
        }
    }
})();



// GLOBAL APP CONTROLLER
const controller = (function(budgetCtrl, uiCtrl) {

    let setupEventListeners = function() {
        //get DOM from uiController
        let DOM = uiCtrl.getDOMSelectors();

        document.querySelector(DOM.DOMSelectors.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.DOMSelectors.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.DOMSelectors.inputType).addEventListener("change",uiCtrl.changedType);
    };


    let updateBudget = function() {
        // calc the budget
        budgetCtrl.calculateBudget();
        // return the budget    
        let budget = budgetCtrl.getBudget();
        // display budget on UI
        uiCtrl.displayBudget(budget);
    };
    let updatePercentages = function () {
        // calc percentages
        budgetCtrl.calculatePercentages();
        //read perc from budget controller
        let percentages = budgetCtrl.getPercentages();
        // update UI with new percentages   
        uiCtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function() {
        // get field input data
        let input, newItem;
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add item to UI
            uiCtrl.addListItem(newItem, input.type);
            // clear input fields
            uiCtrl.clearFields();
            // calc and update budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
    }

    let ctrlDeleteItem = function(event) {
        let itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            //inc-ID
            let splitID = itemID.split("-");
            let type = splitID[0];
            let ID = parseInt(splitID[1]);

            //delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // delete item from UI
            uiCtrl.deleteListItem(itemID);
            // update and show the new budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log("application has started");
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, uiController);

controller.init();