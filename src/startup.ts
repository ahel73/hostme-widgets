import Vue from "vue";
import "./polyfills";
import axios from 'axios';

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
        'array-interval-time',
        'reservation-time',
        'change-time',
        'change-next-contact',
        'guest-reservation-note',
        'next-contact',
        "customerName",
        "email",
        "phoneNumber",
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
        'array-interval-time',
        'reservation-time',
        'change-time',
        'change-next-contact',
        'guest-reservation-note',
        'next-contact',
        "customerName",
        "email",
        "phoneNumber",
    ]
});

document.addEventListener("DOMContentLoaded", () => {
    let vue: Object; // в эту переменную сохраним this-vue для стрелочных функций
    
    const app = new Vue({
        el: 'app',
        data: function () {
            return { i: {} }
        },
        methods: {
            changeDate($event: any) {
                this.i.reservationDay = $event.target.value
            },
            changeTime($event: any) {
                this.i.reservationTime = $event.target.value
            },
            changeGroupSize($event: any) {
                this.i.groupSize = $event.target.value
            },
            changeNextContact() {
                this.i.nextContact = !this.i.nextContact;
                console.log(this.i)
            },
            getSelectDay(day) {
                this.i.reservationDay = day
                alert(this.i.reservationDay)
            },
            /**
             * Формирует массив свободных временных слотов для бронирования
             */
            freeTimeSlots(date: string, partySize: number, rangeInMinutes: number): any {
                
                var query = `https://api.hostmeapp.com/api/core/mb/restaurants/9638/availability?contract.date=${date}%2B02:00&contract.partySize=${partySize}&contract.rangeInMinutes=${rangeInMinutes}
                `

                query = `https://api.hostmeapp.com/api/core/mb/restaurants/9638/availability?date=2021-07-15T15%3A00%3A00%2B02%3A00&partySize=1&rangeInMinutes=900`
                console.log(query)
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
            }
        },
        beforeCreate() {
            console.log('beforeCreate');
            vue = this;
        },
        created: async () : Promise<void> => {
            console.log('created')
            console.log('это тыс', vue)

            var queryString = `${config.HostmeGuestAppApi}/api/core/mb/guest/restaurants/nenu-the-artisan-baker-valletta`
            var resInfo = vue.getQueryApi(queryString).reservationConfig;
            console.log('это аякс', resInfo);
            

            // var d = await axios(`${config.HostmeGuestAppApi}/api/core/mb/guest/restaurants/2033`);
            // console.log('это аксиос', d)
            
            

            var today = new Date(),
                openingHours = resInfo.openingHours.openingHours,
                open = openingHours[today.getDay()].time[0].open.split(':'),
                cloze = openingHours[today.getDay()].time[0].close.split(':'),
                hoursInterval = resInfo.hoursInterval || '15', // Временной интервал резерва
                arrayIntervalTime = [];
            console.log('сегодня день недели: ', today.getDay())
            for (var hour = +open[0], min = +open[1]; hour <= +cloze[0] || min < +cloze[1];) {
                
                if (min >= 60 ) {
                    hour++;
                    min = 0;
                   
                }
                if (hour >= +cloze[0] && min >= +cloze[1]) break;

                arrayIntervalTime.push(hour + '-' + (min == 0 ? '00' : min))
                min += +hoursInterval;
            }
            // arrayIntervalTime = vue.freeTimeSlots(resInfo.openingHours.nextPeriodDate, 1, +resInfo.hoursInterval * 60);
            console.log(arrayIntervalTime)
            var array = vue.freeTimeSlots(resInfo.openingHours.nextPeriodDate, 1, +resInfo.hoursInterval * 60)
            console.log('hhhhh', array)

            var i   = {
                restaurantId: resInfo.id,
                areas: [],
                guestReservationNote: resInfo.guestReservationNote || '',

                today: today, //Сегодняшний день
                openingHours: openingHours, // Рабочии дни с раписанием
                arrayIntervalTime: array,
                reservationTime: array[0].slot, //Время начала резерва
                
                 
                maxAdvanceBookingDays: resInfo.maxAdvanceBookingDays || null, // на сколько дней вперёд можно резервировать                
                reservationDay: resInfo.openingHours.nextPeriodDate.split('T')[0], //День начала резерва


                maxPartySize: resInfo.maxPartySize || 0,
                minPartySize: resInfo.minPartySize || 0,
                groupSize: resInfo.minPartySize || 0,

                // Раздел управления виджетоь
                nextContact: false, // Открывает блок с контактами заказчика
                
                customerName: '',
                email: '',
                phoneNumber: '',

                deliveryType: '',
                
                order: {
                    orderItems: [],
                    tips: 0,
                }

            }

            resInfo.areas = ['веранда', 'балкон', 'фойе']
            if (resInfo.areas && resInfo.areas.length) {
                resInfo.areas.forEach(element => {
                    i.areas.push({name: element, cheked: false})
                });
            }
            vue.i = i;
            console.log(resInfo);
            console.log(vue.i);
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