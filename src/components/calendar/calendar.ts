// https://iportal.com.ua/calendar-na-vue-js/
import Vue from "vue";

import template from "./calendar.html"


Vue.component("calendar", {
    template: template,
    props: [
        "is-output"
    ],
    data: function () {
        return {
             
			dFirstMonth: '1',
			day:["Mn", "Tu","We","Th","Fr","Sa", "Su"],
			monthes: ["January","February","March","April","May","June","July","August","September","October","November","December"],
            date: new Date(),
            month: new Date().getMonth(),    
            year: new Date().getFullYear(),
            labelUtc: new Date().getTime(), // UTC метка сегодняшнего дня
            selectDay: 0,
        }
    },

    methods:{
        /**
         * Формируем массив с днями по текущему или выбранному месяцу. в массиве находятся подмассивы в виде недель в которых находятся дни входящие в эти недели
         * @returns Array
         */
        calendar () {
            var monthDays  = []; // Массив с днями месяца которые находятся в подмассивах являющимися неделями, т.е. в массиве будут подмасивы (недели)в которых находятся дни по этой неделе
            var week = 0; // номера недели
            monthDays[week] = [];

            // Усианавливаем последний день текущего месяца
            var dlast = new Date(this.year, this.month + 1, 0).getDate();            
            
            // Заполняем подмассивы недель днями
            for (let i = 1; i <= dlast; i++) {

                var day = new Date(this.year, this.month, i, this.date.getHours(), this.date.getMinutes(), this.date.getSeconds(), this.date.getMilliseconds());
                
                var a = {
                    index: i,
                    weekDay: day.getDay(),
                    past: day.getTime() < this.labelUtc,
                };
                // Если день недели является выходным для заведения, ставим доп класс
                a.output = this.isOutput(a.weekDay);

                
                // Если день недели итерируемого дня месяца не равен началу недели, то загоняем его текущую неделю по умолчанию нулевая
                if ( a.weekDay != this.dFirstMonth) {
                    
                    monthDays[week].push(a);
                }
                // Если первый день недели то увеличиваем счётчик недели и загоняем его в новую неделю (подмассив )
                else {
                    week++;                    
                    monthDays[week] = [];
                    monthDays[week].push(a);
                }

                // Если итерируемый день равен текущей дате  выделяем его
                if (i == new Date().getDate() && this.year == new Date().getFullYear() && this.month == new Date().getMonth()) { a.current = '#747ae6' };
                
                // Если день недели итерируемого объекта общий выходной то красим цвет
                if (a.weekDay == 6 || a.weekDay == 0) { a.weekend = '#ff0000' };
            }
            
            // Если первый день месяца не является первым днём недели то перед этим днём добавляенм в неделе (подмассиве) пробелы
            if (monthDays[0].length > 0) {
                for (let i = monthDays[0].length; i < 7; i++) {
                    monthDays[0].unshift('');
                    
                }
            }

            this.dayChange;
            return monthDays;
        },
        
        /**
         * Уменьшаем месяц но не меньше текущего
         */
        decrease() {
            var date = new Date();
            if (this.month - 1 < date.getMonth() && this.year <= date.getFullYear()) {
                alert('в прошлое нельзя!');
                return;
            }
            this.month--;
            if (this.month < 0) {
                this.month = 12;
                this.month--;
                this.year--;
            }
        },
        increase (){
                this.month++;
                if (this.month > 11) {
                    this.month = -1;
                    this.month++;
                    this.year++;
                }
        },
        getSelectDay ($event: any) {
            var day = $event.target.dataset.day;
            var date = new Date();

            if (day < date.getDate() && this.month <= date.getMonth() && this.year <= date.getFullYear()) {
                alert('забронировать на прошлое нельзя')
                return;
            }
            var dm = [this.month, day]
            dm.forEach((el, i) => {
                if (i == 0) ++el;
                if (el < 10) dm[i] = '0' + el;
            })
            var dayFull = `${this.year}-${dm[0]}-${dm[1]}`
            console.log(dayFull)
            this.$emit("change-day", dayFull)
        }
    },
    
    computed: {
        /** Меняем первый день недели
         * 
         */
        dayChange () :void {
                if(this.dFirstMonth == 0){
                    this.day = ["Su", "Mn", "Tu","We","Th","Fr","Sa"]
                }else{
                    this.day = ["Mn", "Tu","We","Th","Fr","Sa", "Su"]
                }
            },
		},
});