<template lang="html">
  <div>
    <datepicker @date="selectedDate" @timespan="selectedSpan" :dateEvents="dateEvents"/>
    <div class="details">
      <div class="toolbar">
        <button type="button" class="btn btn--primary" @click="getRecurrent"><i class="fa fa-repeat"></i> Get recurrent data</button>
        <button type="button" class="btn btn--primary" @click="toggleCategoryModal">Handle categories</button>
      </div>
      <h1 class="details__header">{{ currentMonth }}</h1>
      <section class="details-day" v-if="date">
        <div class="box">
          <h3 class="box__header">{{ date }} <button type="button" class="btn btn--secondary btn--sm" @click="toggleAddDateEventModal"><i class="fa fa-plus fa-fw"></i></button></h3>
          <div class="box__content">
            <ul class="list">
              <li v-for="e in dateEvents[new Date(date).getDate()]">
                <span class="color" :style="{backgroundColor: setCategoryColor(e.category)}"></span>
                <span class="name">{{ e.description }}</span>
                <span class="number">{{ currency(e.amount) }}</span>
                <button type="button" class="btn btn--sm btn--delete"><i class="fa fa-close"></i></button>
              </li>
            </ul>
            <div class="alert" v-if="!dateEvents[new Date(date).getDate()]">No event on this date, <a href="#" @click.prevent="toggleAddDateEventModal">add event</a></div>
          </div>
        </div>
      </section>

      <section class="details-month">
        <div class="box">
          <h3 class="box__header">Income <button type="button" class="btn btn--secondary btn--sm" @click="toggleIncomeModal"><i class="fa fa-plus fa-fw"></i></button></h3>
          <div class="box__content">
            <ul class="list" v-if="!noIncome">
              <li v-for="(item, id) in income">
                <a href="#" class="name" @click.prevent="editIncome(id)">{{ item.label }} <i v-if="item.recurrent" class="recurrent fa fa-repeat" title="Recurrent"></i></a>
                <span class="number">{{ currency(item.amount) }}</span>
                <button type="button" class="btn btn--sm btn--delete" @click="removeIncome(id)"><i class="fa fa-close"></i></button>
              </li>
              <li class="sum">
                <span class="name">Total</span>
                <span class="number">{{ currency(incomeSum) }}</span>
              </li>
            </ul>
            <div class="alert" v-if="noIncome">No income, <a href="#" @click.prevent="toggleIncomeModal">add income</a></div>
          </div>
        </div>
        <div class="box">
          <h3 class="box__header">Expences <button type="button" class="btn btn--secondary btn--sm" @click="toggleExpenceModal"><i class="fa fa-plus fa-fw"></i></button></h3>
          <div class="box__content">
            <ul class="list" v-if="!noExpences">
              <li v-for="(item, id) in monthlyExpences">
                <span class="color" :style="{backgroundColor: setCategoryColor(item.category)}"></span>
                <a href="#" class="name" @click.prevent="editExpence(id)">{{item.label }} <i v-if="item.recurrent" class="recurrent fa fa-repeat" title="Recurrent"></i></a>
                <span class="number">{{ currency(item.amount) }}</span>
                <button type="button" class="btn btn--sm btn--delete" @click="removeExpence(id)"><i class="fa fa-close"></i></button>
              </li>
              <li class="sum">
                <span class="name">Total</span>
                <span class="number">{{ currency(expencesSum) }}</span>
              </li>
            </ul>
            <div class="alert" v-if="noExpences">No expences, <a href="#" @click.prevent="toggleExpenceModal">add expence</a></div>
          </div>
        </div>
      </section>
    </div>

    <!-- HANDLE DATE EVENT -->
    <modal :visible="showAddDateEventModal" @close="toggleAddDateEventModal" title="Event">
      <template slot="content">
        <div class="form">
          <form @submit.prevent="addDateEvent">
            <div class="form-control">
              <label for="eventCategory">Category</label>
              <select id="eventCategory" v-model="eventCategory">
                <option v-for="(c, k) in myCategories" :value="k" v-if="!c.disabled">{{c.name}}</option>
              </select>
              <a href="#" @click.prevent="toggleCategoryModal"><small>Add new category</small></a>
            </div>
            <div class="form-control">
              <label for="dateEventDescription">Description</label>
              <input type="text" id="amount" required v-model="dateEventDescription">
            </div>
            <div class="form-control">
              <label for="dateEventAmount">Amount</label>
              <input type="number" id="amount" step="0.01" required v-model="dateEventAmount">
            </div>
          </form>
        </div>
      </template>
      <template slot="footer">
        <button type="button" class="btn btn--cancel" @click="toggleAddDateEventModal">Cancel</button>
        <button type="submit" class="btn btn--primary" @click="addDateEvent" :disabled="!dateEventDescription || !dateEventAmount">Add</button>
      </template>
    </modal>

    <!-- HANDLE INCOME -->
    <modal :visible="showIncomeModal" @close="toggleIncomeModal" title="Income">
      <template slot="content">
        <div class="form">
          <p>Add any income you have during this month. It could be salary, allowance or any other type of income.</p>
          <form @submit.prevent="addMonthlyIncome">
            <div class="form-control">
              <label for="label">Label</label>
              <input type="text" id="label" required v-model="incomeLabel">
            </div>
            <div class="form-control">
              <label for="amount">Amount</label>
              <input type="number" id="amount" step="0.01" required v-model="incomeAmount">
            </div>
            <div class="form-control">
              <label for="incomeIsRecurrent">
                <input type="checkbox" id="incomeIsRecurrent" v-model="incomeIsRecurrent">
                Recurrent income every month
              </label>
            </div>
          </form>
        </div>
      </template>
      <template slot="footer">
        <button type="button" class="btn btn--cancel" @click="toggleIncomeModal">Cancel</button>
        <button v-if="!incomeEditId" type="submit" class="btn btn--primary" @click="addMonthlyIncome" :disabled="!incomeLabel || !incomeAmount">Add</button>
        <button v-if="incomeEditId" type="submit" class="btn btn--primary" @click="updateMonthlyIncome" :disabled="!incomeLabel || !incomeAmount">Save</button>
      </template>
    </modal>

    <!-- HANDLE EXPENCE -->
    <modal :visible="showMonthlyExpenceModal" @close="toggleExpenceModal" title="Monthly expence">
      <template slot="content">
        <div class="form">
          <p>A monthly expence is a sum paid for the whole month, such as electricity bill, rental fees, phone etc.</p>
          <form @submit.prevent="addMonthlyExpence">
            <div class="form-control">
              <label for="monthlyExpenceCategory">Category</label>
              <select id="monthlyExpenceCategory" v-model="monthlyExpenceCategory">
                <option v-for="(c, k) in myCategories" :value="k" v-if="!c.disabled">{{c.name}}</option>
              </select>
              <a href="#" @click.prevent="toggleCategoryModal"><small>Add new category</small></a>
            </div>
            <div class="form-control">
              <label for="monthlyExpenceLabel">Label</label>
              <input type="text" id="monthlyExpenceLabel" required v-model="monthlyExpenceLabel">
            </div>
            <div class="form-control">
              <label for="monthlyExpenceAmount">Amount</label>
              <input type="number" id="monthlyExpenceAmount" step="0.01" required v-model="monthlyExpenceAmount">
            </div>
            <div class="form-control">
              <label for="monthlyExpenceIsRecurrent">
                <input type="checkbox" id="monthlyExpenceIsRecurrent" v-model="monthlyExpenceIsRecurrent">
                Recurrent expence every month
              </label>
            </div>
          </form>
        </div>
      </template>
      <template slot="footer">
        <button type="button" class="btn btn--cancel" @click="toggleExpenceModal">Cancel</button>
        <button v-if="!monthlyExpenceEditId" type="submit" class="btn btn--primary" @click="addMonthlyExpence" :disabled="!monthlyExpenceLabel || !monthlyExpenceCategory || !monthlyExpenceAmount">Add</button>
        <button v-if="monthlyExpenceEditId" type="submit" class="btn btn--primary" @click="updateMonthlyExpence" :disabled="!monthlyExpenceLabel || !monthlyExpenceCategory || !monthlyExpenceAmount">Save</button>
      </template>
    </modal>

    <!-- HANDLE CATEGORIES -->
    <modal :visible="showCategoryModal" @close="toggleCategoryModal" title="Categories">
      <template slot="content">
        <div class="form">
          <ul class="list list--category" v-if="!noCategories">
            <li v-for="(c, k) in categories">
              <span class="color" :style="{backgroundColor: c.color}"></span>
              <span class="name">{{ c.name }}</span>
              <button type="button" class="btn btn--delete btn--sm" @click="removeCategory(k)"><i class="fa fa-close"></i></button>
            </li>
          </ul>
          <div class="alert alert--warning" v-if="noCategories">You have no categories</div>
          <fieldset>
            <h3>New category</h3>
            <form @submit.prevent="addCategory">
              <div class="form-control">
                <label for="label">Category name</label>
                <input type="text" id="label" required v-model="categoryName">
              </div>
              <div class="form-control">
                <label for="color">Category color</label>
                <input type="hidden" id="color" required v-model="categoryColor">
                <ul class="color-picker">
                  <li
                    class="palette"
                    v-for="color in categoryColors"
                    :style="{backgroundColor: color}"
                    @click="categoryColor = color"
                    :class="{'selected': (categoryColor === color)}"
                  ></li>
                </ul>
              </div>
            </form>
          </fieldset>
        </div>
      </template>
      <template slot="footer">
        <button type="button" class="btn btn--cancel" @click="toggleCategoryModal">Cancel</button>
        <button type="submit" class="btn btn--primary" @click="addCategory" :disabled="!categoryName || !categoryColor">Add</button>
      </template>
    </modal>
  </div>
</template>

<script>
import { db, auth } from '../../config'
import datepicker from '@/components/datepicker'
import modal from '@/components/modal'
export default {
  components: {
    datepicker,
    modal
  },
  data () {
    return {
      date: null,
      span: null,
      uid: auth.currentUser.uid,
      currentMonth: '',
      monthNames: ['January', 'February', 'Mars', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

      categories: null,
      categoryColors: ['#505160', '#74D3AE', '#1995AD', '#DD9787', '#DDBC95', '#B38867', '#F52549', '#CB0000', '#68829E', '#598234', '#8EBA43', '#66A6AD', '#375E97', '#4CB5F5', '#FFBB00', '#DE7A22', '#8D230F', '#F18D9E'],
      noCategories: false,
      showCategoryModal: false,
      categoryName: '',
      categoryColor: '#ff0000',

      showIncomeModal: false,
      incomeEditId: null,
      incomeLabel: '',
      incomeAmount: '',
      incomeIsRecurrent: false,
      income: null,
      noIncome: true,

      showAddDateEventModal: false,
      eventCategory: null,
      dateEventDescription: '',
      dateEventAmount: '',
      dateEvents: {},

      showMonthlyExpenceModal: false,
      monthlyExpenceEditId: null,
      monthlyExpences: null,
      noExpences: true,
      monthlyExpenceCategory: '',
      monthlyExpenceLabel: '',
      monthlyExpenceAmount: '',
      monthlyExpenceIsRecurrent: false
    }
  },
  computed: {
    incomeSum () {
      let income = this.income
      let sum = 0
      for (const prop in income) {
        sum = sum + parseFloat(income[prop].amount)
      }
      return sum.toFixed(2)
    },
    expencesSum () {
      let income = this.monthlyExpences
      let sum = 0
      for (const prop in income) {
        sum = sum + parseFloat(income[prop].amount)
      }
      return sum.toFixed(2)
    },
    myCategories () {
      return this.categories
    }
  },
  methods: {
    init () {
      this.currentMonth = this.monthNames[new Date(this.span).getMonth()]
      this.fetchCategories()
      this.fetchIncome()
      this.fetchMonthlyExpences()
      this.fetchDateEvents()
    },
    controlSpan () {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid + '/' + year).once('value')
      .then(function (snapshot) {
        if (snapshot.val()) {
          self.fetchMonthly(year, month)
        } else {
          self.createSpan(year)
        }
      })
    },
    createSpan (year) {
      var months = {}
      for (let i = 1; i < 13; i++) {
        months[i] = 'undefined'
      }
      db.ref('users/' + this.uid + '/' + year).set(months)
      this.controlSpan()
    },
    selectedSpan (dates) {
      this.span = dates
    },
    selectedDate (date) {
      this.date = date
    },
    toggleCategoryModal () {
      this.showCategoryModal = !this.showCategoryModal
    },
    addCategory () {
      let name = this.categoryName
      let category = { name: name, color: this.categoryColor, disabled: false }
      var ref = db.ref('users/' + this.uid).child('categories')
      ref.push(category)
      this.categoryName = ''
      this.fetchCategories()
      this.toggleCategoryModal()
    },
    removeCategory (id) {
      var ref = db.ref('users/' + this.uid).child('categories').child(id)
      ref.remove()
      this.fetchCategories()
    },
    fetchCategories () {
      var self = this
      db.ref('/users/' + this.uid + '/categories').once('value')
      .then(function (snapshot) {
        if (snapshot.val()) {
          self.noCategories = false
          self.categories = snapshot.val()
        } else {
          self.noCategories = true
        }
      })
    },
    setCategoryColor (category) {
      if (this.myCategories[category]) {
        return this.myCategories[category].color
      }
      console.log('category color was not found')
      return '#eee'
    },
    toggleIncomeModal () {
      this.showIncomeModal = !this.showIncomeModal
    },
    addMonthlyIncome () {
      let income = {
        label: this.incomeLabel,
        amount: this.incomeAmount,
        recurrent: this.incomeIsRecurrent
      }
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('income')
      ref.push(income)
      this.incomeLabel = ''
      this.incomeAmount = ''
      this.incomeIsRecurrent = false
      this.fetchIncome()
      this.showIncomeModal = false
    },
    updateMonthlyIncome () {
      let income = {
        label: this.incomeLabel,
        amount: this.incomeAmount,
        recurrent: this.incomeIsRecurrent
      }
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('income').child(this.incomeEditId)
      ref.update(income)
      this.incomeLabel = ''
      this.incomeAmount = ''
      this.incomeIsRecurrent = false
      this.fetchIncome()
      this.toggleIncomeModal()
      this.incomeEditId = null
    },
    editIncome (id) {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid).child(year).child(month).child('income').child(id).once('value')
      .then(function (snapshot) {
        if (snapshot.val() && snapshot.val() !== 'undefined') {
          self.toggleIncomeModal()
          self.incomeEditId = id
          self.incomeLabel = snapshot.val().label
          self.incomeAmount = snapshot.val().amount
          self.incomeIsRecurrent = snapshot.val().recurrent
        } else {
          console.warn('Could not get expence!')
        }
      })
    },
    removeIncome (id) {
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('income').child(id)
      ref.remove()
      this.fetchIncome()
    },
    fetchIncome () {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid).child(year).child(month).child('income').once('value')
      .then(function (snapshot) {
        if (snapshot.val() && snapshot.val() !== 'undefined') {
          self.noIncome = false
          self.income = snapshot.val()
        } else {
          self.income = null
          self.noIncome = true
        }
      })
    },
    addMonthlySaving () {

    },
    toggleExpenceModal () {
      this.showMonthlyExpenceModal = !this.showMonthlyExpenceModal
    },
    addMonthlyExpence () {
      // let recurrent = this.monthlyExpenceIsRecurrent
      let expence = {
        label: this.monthlyExpenceLabel,
        amount: this.monthlyExpenceAmount,
        category: this.monthlyExpenceCategory,
        recurrent: this.monthlyExpenceIsRecurrent
      }
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('expences')
      ref.push(expence)
      this.monthlyExpenceCategory = ''
      this.monthlyExpenceLabel = ''
      this.monthlyExpenceAmount = ''
      this.monthlyExpenceIsRecurrent = false
      this.fetchMonthlyExpences()
      this.showMonthlyExpenceModal = false
    },
    updateMonthlyExpence () {
      // let recurrent = this.monthlyExpenceIsRecurrent
      let expence = {
        label: this.monthlyExpenceLabel,
        amount: this.monthlyExpenceAmount,
        category: this.monthlyExpenceCategory,
        recurrent: this.monthlyExpenceIsRecurrent
      }
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('expences').child(this.monthlyExpenceEditId)
      ref.update(expence)
      this.monthlyExpenceCategory = ''
      this.monthlyExpenceLabel = ''
      this.monthlyExpenceAmount = ''
      this.monthlyExpenceIsRecurrent = false
      this.fetchMonthlyExpences()
      this.toggleExpenceModal()
      this.monthlyExpenceEditId = null
    },
    removeExpence (id) {
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('expences').child(id)
      ref.remove()
      this.fetchMonthlyExpences()
    },
    editExpence (id) {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid).child(year).child(month).child('expences').child(id).once('value')
      .then(function (snapshot) {
        if (snapshot.val() && snapshot.val() !== 'undefined') {
          self.toggleExpenceModal()
          self.monthlyExpenceEditId = id
          self.monthlyExpenceCategory = snapshot.val().category
          self.monthlyExpenceLabel = snapshot.val().label
          self.monthlyExpenceAmount = snapshot.val().amount
          self.monthlyExpenceIsRecurrent = snapshot.val().recurrent
        } else {
          console.warn('Could not get expence!')
        }
      })
    },
    fetchMonthlyExpences () {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid).child(year).child(month).child('expences').once('value')
      .then(function (snapshot) {
        if (snapshot.val() && snapshot.val() !== 'undefined') {
          self.monthlyExpences = snapshot.val()
          self.noExpences = false
        } else {
          self.monthlyExpences = null
          self.noExpences = true
        }
      })
    },
    toggleAddDateEventModal () {
      this.showAddDateEventModal = !this.showAddDateEventModal
    },
    addDateEvent () {
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      let date = new Date(this.date).getDate()
      let dateEvent = {
        category: this.eventCategory,
        description: this.dateEventDescription,
        amount: this.dateEventAmount
      }
      var ref = db.ref('users/' + this.uid).child(year).child(month).child('events').child(date)
      ref.push(dateEvent)
      this.dateEventDescription = ''
      this.dateEventAmount = ''
      this.fetchDateEvents()
      this.showAddDateEventModal = false
    },
    fetchDateEvents () {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth() + 1
      db.ref('/users/' + this.uid).child(year).child(month).child('events').once('value')
      .then(function (snapshot) {
        if (snapshot.val() && snapshot.val() !== 'undefined') {
          self.dateEvents = snapshot.val()
        } else {
          self.dateEvents = {}
        }
      })
    },
    getRecurrent () {
      var self = this
      let year = new Date(this.span).getFullYear()
      let month = new Date(this.span).getMonth()
      if (month === 0) {
        year = year - 1
        month = 12
      }
      db.ref('/users/' + this.uid).child(year).child(month).once('value')
      .then(function (snapshot) {
        if (snapshot.val()) {
          self.handleRecurrent(snapshot.val())
        } else {
          console.warn('No data from last month')
        }
      })
    },
    handleRecurrent (snap) {
      var snapshot = snap
      if (snapshot.income) {
        let income = snapshot.income
        let recurrentIncome = []
        for (let key in income) {
          if (income[key].recurrent) {
            recurrentIncome.push(income[key])
          }
        }
        if (recurrentIncome.length > 0) {
          for (let i = 0; i < recurrentIncome.length > 0; i++) {
            this.incomeLabel = recurrentIncome[i].label
            this.incomeAmount = recurrentIncome[i].amount
            this.incomeIsRecurrent = recurrentIncome[i].recurrent
            this.addMonthlyIncome()
          }
        }
      }
      if (snapshot.expences) {
        let expences = snapshot.expences
        let recurrentExpences = []
        for (let key in expences) {
          if (expences[key].recurrent) {
            recurrentExpences.push(expences[key])
          }
        }
        if (recurrentExpences.length > 0) {
          for (let i = 0; i < recurrentExpences.length > 0; i++) {
            this.monthlyExpenceLabel = recurrentExpences[i].label
            this.monthlyExpenceAmount = recurrentExpences[i].amount
            this.monthlyExpenceCategory = recurrentExpences[i].category
            this.monthlyExpenceIsRecurrent = recurrentExpences[i].recurrent
            this.addMonthlyExpence()
          }
        }
      }
    },
    currency (val) {
      const currency = Number(parseFloat(val).toFixed(2)).toLocaleString('sv', {style: 'currency', currency: 'SEK'})
      return currency
    }
  },
  watch: {
    span: function () {
      this.init()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables';
.toolbar {
  margin: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.details {
  &__header {
    text-align: center;
  }
}
.details-month {
  display: flex;
  flex-direction: column;
  @media (min-width: $bp-md) {
    flex-direction: row;
  }
}
.color-picker {
  list-style: none;
  margin: .5rem 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  .palette {
    flex: 1 0 30px;
    max-width: 30px;
    height: 30px;
    margin: 1px;
    transition: all .12s ease-in-out;
    &:hover {
      box-shadow: 0 0 5px rgba(0,0,0,.4), inset 0 0 0 1px $white;
      transform: scale(1.2);
      z-index: 2;
    }
    &.selected {
      box-shadow: 0 0 5px rgba(0,0,0,.4), inset 0 0 0 1px $white;
      transform: scale(1.4);
      z-index: 2;
    }
  }
}
</style>
