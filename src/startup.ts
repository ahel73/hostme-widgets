import Vue from "vue";
import "./polyfills";
import axios from 'axios';
import { Moment } from "moment";
import moment = require("moment");
import momentTZ = require("moment-timezone/builds/moment-timezone-with-data-2012-2022.min");

import app from "./components/app/app.html";
import hostmeReserve from "./components/hostme-reserve/hostme-reserve.html";
import "./components/contact-block/contact-block"
import "./components/calendar/calendar"

import {config} from './components/constants';



Vue.component("hostme-reserve", {
    template: hostmeReserve,
    methods: {
        getSelectDay(day) {
            this.$emit("change-day", day)
        }
    },
    props: [
        'areas',
        'max-party-size',
        'min-party-size',
        'groupSize',
        'change-group-size',
        'reservation-day',
        'change-date',
        'free-time-slots',
        'reservation-time',
        'change-time',
        'change-next-contact',
        'guest-reservation-note',
        'next-contact',
        "customer-name",
        "change-customer-name",
        "email",
        "change-email",
        "phone-number",
        "change-phone-number",
        "is-output",
    ]
});

Vue.component("app", {
    template: app,
    methods: {
        getSelectDay(day) {
            this.$emit("change-day", day)
        }
    },
    props: [
        'areas',
        'max-party-size',
        'min-party-size',
        'groupSize',
        'change-group-size',
        'reservation-day',
        'change-date',
        'free-time-slots',
        'reservation-time',
        'change-time',
        'change-next-contact',
        'guest-reservation-note',
        'next-contact',
        "customer-name",
        "change-customer-name",
        "email",
        "change-email",
        "phone-number",
        "change-phone-number",
        "is-output",
    ]
});

document.addEventListener("DOMContentLoaded", () => {
    let vue: Object; // в эту переменную сохраним this-vue для стрелочных функций
    
    const app = new Vue({
        el: 'app',
        data: function () {
            return {
                i: {},
                changeDateFlag: false, // Наблюдатель за выбором даты
            }
        },
        methods: {
            changeDate($event: any) {
                this.i.reservationDay = $event.target.value
                this.changeDateFlag = !this.changeDateFlag;
            },
            changeTime($event: any) {
                this.i.reservationTime = $event.target.value
            },
            changeGroupSize($event: any) {
                this.i.groupSize = $event.target.value
            },
            changeCustomerName($event: any) {
                this.i.customerName = $event.target.value
            },
            changeEmail($event: any) {
                this.i.email = $event.target.value
            },
            changePhoneNumber($event: any) {
                this.i.phoneNumber = $event.target.value
            },
            changeNextContact() {
                this.i.nextContact = !this.i.nextContact;
                console.log(this.i)
            },
            getSelectDay(day) {
                this.i.reservationDay = day;
                this.changeDateFlag = !this.changeDateFlag;
            },
            /**
             * Формирует массив свободных временных слотов для бронирования
             */
            getFreeTimeSlots(): any {
                
                var url = new URL(`${config.newUrlApi}/api/core/mb/restaurants/${vue.i.restaurantId}/availability`);
                var tz = momentTZ.tz(vue.i.timeZone).format()
                tz = tz.substring(tz.length - 6)
                var date =  vue.i.reservationDay + 'T' + '15:00:00' + tz
                url.searchParams.set('date', date);
                url.searchParams.set('partySize', vue.i.groupSize);
                var secund = '' + vue.i.hoursInterval * 60
                url.searchParams.set('rangeInMinutes', secund);
                var query = url.href;
                
                var availability = this.getQueryApi(query)
                var openingHours = []
                if (availability.length) {
                    availability.forEach(el => {
                        var pos = el.time.lastIndexOf(':')
                        var slot = el.time.slice(0, pos);
                        openingHours.push({
                            'slot': slot,
                            time: el.time
                        });
                        // console.log('объект слотов', openingHours)
                    });
                }
                
                return openingHours;
            },
            /**
             * Запрос 
             */
            getQueryApi(queryString: string): any {
                var ajax = new XMLHttpRequest();
                ajax.open('get', queryString, false)
                ajax.send();
                return JSON.parse(ajax.responseText)
            },

            getQueryApi_: async (queryString: string) => {
                var a = await axios.get(queryString)
                return JSON.parse(a.request.responseText)
            },
            isOutput(weekDay: string) {
                return this.i.workingDay[weekDay] ? false : true;
            }
        },
        watch: {
            changeDateFlag() {
                this.i.freeTimeSlots = this.getFreeTimeSlots()
            }
        },
        beforeCreate() {
            console.log('beforeCreate');
            vue = this;
        },
        created() {
            console.log('created')
            
            var queryString = `${config.newUrlApi}/api/core/mb/restaurants/9638`
            var resInfo = vue.getQueryApi(queryString);
            console.log('это аякс', resInfo);
            
            

            var workingDay = {};
            resInfo.openingHours.openingHours.forEach(day => {
                workingDay[''+day.weekDay] = day.time[0]
            });           
            

            var i = {
                
                restaurantId: resInfo.id,
                areas: [], // локализация
                guestReservationNote: resInfo.guestReservationNote || '', // Заметка при резервировании

                workingDay: workingDay, // Рабочии дни с раписанием
                freeTimeSlots: [],
                
                
                hoursInterval: resInfo.hoursInterval || '15', // Временной интервал резерва
                maxAdvanceBookingDays: +resInfo.maxAdvanceBookingDays || 365, // на сколько дней вперёд можно резервировать                
                reservationDay: resInfo.openingHours.nextPeriodDate.split('T')[0], //День начала резерва
                reservationTime: '', //Время начала резерва
                timeZone: resInfo.timeZone, // Временной пояс заведения


                maxPartySize: resInfo.maxPartySize || 7,
                minPartySize: resInfo.minPartySize || 1,
                groupSize: resInfo.minPartySize || 1,

                // Раздел управления виджетоь
                nextContact: false, // Открывает блок с контактами заказчика
                
                // Контактные данные заказчика
                customerName: '',
                email: '',
                phoneNumber: '',

                deliveryType: '',
                
                order: {
                    orderItems: [],
                    tips: 0,
                }

            }
            vue.i = i;

            i.freeTimeSlots = vue.getFreeTimeSlots();
            i.reservationTime = i.freeTimeSlots[0].slot;
        },
        beforeMount() {
            console.log('beforeMount')
        },
        mounted() {
            console.log('mounted')
        },
        beforeUpdate() {
            console.log('beforeUpdate')
        },
        updated() {
            console.log('updated')
        },
    });
    // window.ga = app
});