<template lang="html">
  <section class="datepicker" ref="datepicker">
    <header class="datepicker-month">
      <button type="button" class="btn" @click="prevMonth()"><i class="fa fa-chevron-left"></i></button>
      <div class="datepicker-month-current">
        {{monthNames[currentMonth]}} {{currentYear}}
      </div>
      <button type="button" class="btn" @click="nextMonth()"><i class="fa fa-chevron-right"></i></button>
    </header>
    <div class="datepicker-weekdays">
      <abbr class="datepicker-weekdays__item" v-for="(day, i) in dayOrder" :title="dayNames[day]">{{ dayNames[day].substring(0,2) }}</abbr>
    </div>
    <div class="datepicker-dates">
      <button
        type="button"
        class="btn datepicker-dates__item"
        v-for="(date, i) in daysInMonth"
        :disabled="(date.getMonth() !== currentMonth)"
        :class="{
          'today': isToday(date),
          'selected': isSelected(date)
        }"
        @click="selectDate(date)"
      >
        {{ date.getDate() }}
        <span v-if="checkDateEvent(date, date.getMonth())" class="event"></span>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    dateEvents: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      today: null,
      daysInMonth: [],
      selectedDate: null,
      currentDate: null,
      currentMonth: null,
      currentYear: null,
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayOrder: [1, 2, 3, 4, 5, 6, 0],
      monthNames: ['January', 'February', 'Mars', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  },
  mounted () {
    this.init()
  },
  computed: {
  },
  methods: {
    init () {
      const date = new Date().getTime()
      let today = date
      today = new Date(new Date(today).setHours(0, 0, 0, 0)).getTime()
      this.today = today
      this.currentDate = date
      this.currentMonth = new Date(date).getMonth()
      this.currentYear = new Date(date).getFullYear()
      this.getDaysInMonth(this.currentYear, this.currentMonth)
    },
    getDaysInMonth (year, month) {
      const date = new Date(year, month, 1)
      let days = []
      while (date.getMonth() === month) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
      }
      // Fill out before
      let before = this.padBefore(days)
      days = before.concat(days)
      // Fill out after
      let after = this.padAfter(days)
      days = days.concat(after)
      this.daysInMonth = days
      this.$emit('timespan', new Date(year, month, 1))
    },
    padBefore (dates) {
      let padAmount = dates[0].getDay() === 6 ? 6 : dates[0].getDay() - 1
      let padDate = new Date(dates[0])
      let padBeforeArray = []
      while (padAmount > 0) {
        padBeforeArray.unshift(new Date(padDate.setDate(padDate.getDate() - 1)))
        padAmount--
      }
      return padBeforeArray
    },
    padAfter (dates) {
      let padAmount = 42 - dates.length
      let padDate = new Date(dates[dates.length - 1])
      let padAfterArray = []
      while (padAmount > 0) {
        padAfterArray.push(new Date(padDate.setDate(padDate.getDate() + 1)))
        padAmount--
      }
      return padAfterArray
    },
    isToday (date) {
      const target = new Date(date).getTime()
      if (target === this.today) {
        return true
      }
      return false
    },
    isSelected (date) {
      const target = new Date(date).getTime()
      if (target === this.selectedDate) {
        return true
      }
      return false
    },
    selectDate (date) {
      const timestamp = new Date(date).getTime()
      this.selectedDate = timestamp
      this.currentDate = timestamp
      this.currentMonth = new Date(timestamp).getMonth()
      this.currentYear = new Date(timestamp).getFullYear()
      this.$emit('date', new Date(timestamp).toLocaleDateString())
    },
    prevMonth () {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear = this.currentYear - 1
      } else {
        this.currentMonth = this.currentMonth - 1
      }
      this.changeMonth()
    },
    nextMonth () {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear = this.currentYear + 1
      } else {
        this.currentMonth = this.currentMonth + 1
      }
      this.changeMonth()
    },
    changeMonth () {
      this.getDaysInMonth(this.currentYear, this.currentMonth)
    },
    checkDateEvent (date, month) {
      let events = this.dateEvents
      let day = new Date(date).getDate()
      if (events[day] && month === this.currentMonth) {
        return true
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';
.datepicker {
  width: 100%;
  background-color: $white;
  border-bottom: 1px solid $gray-light-1;
  margin: 0 0 1rem 0;
  &-month {
    display: flex;
    align-items: center;
    justify-content: space-between;
    button {
      padding: 1rem;
      background-color: $white;
      &:hover {
        background-color: $gray-light-3;
      }
    }
  }
  &-weekdays,
  &-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-column-gap: 1px;
    grid-row-gap: 1px;
  }
  &-weekdays {
    border-bottom: 1px solid $gray-light-2;
    &__item {
      text-decoration: none;
      display: block;
      text-align: center;
      padding: .2rem;
      font-size: .8rem;
      color: $gray-dark-5;
    }
  }
  &-dates {
    &__item {
      position: relative;
      background-color: $white;
      color: $gray-dark-5;
      min-height: 40px;
      font-weight: bold;
      .event {
        position: absolute;
        bottom: 2px;
        right: 2px;
        display: inline-block;
        width: 5px;
        height: 5px;
        background-color: $gray-dark-4;
        border-radius: 50%;
      }
      &[disabled] {
        cursor: not-allowed;
        font-weight: normal;
        color: $gray;
        &:hover {
          background-color: $white;
        }
      }
      &:hover {
        background-color: $gray-light-3;
      }
      &.today {
        background-color: $green-light-4;
        &:hover {
          background-color: $green-light-5;
        }
      }
      &.selected {
        background-color: $blue;
        color: $white;
        &:hover {
          background-color: $blue-light-1;
        }
        .event {
          background-color: $white;
        }
      }
    }
  }
}
</style>
