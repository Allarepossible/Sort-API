/**
 * Created by Leisan on 26.03.2016.
 *
 * Данное API предоставляет методы для работы с карточками путешественника
 *
 * Формат карточки - Объект с 3 своиствами:
 * 1) from : Пункт отправления
 * 2) to : Пункт назначения
 * 3) transport : Информация о транспорте, на данном участке пути с дополнительными сведениями (номер рейса, номер места и прочее) - также является объектом со свойствами, которые изменяются в зависимости от типа транспорта:
 *      3.1) type : вид транспорта ('train', 'flight', 'bus')
 *      3.2.1) train и bus имеют своиства:
 *              seat : Номер места в салоне(вагоне), записывается в виде 'Seat 5A', если места не предусмотрено, то нужно написать 'No seat assignment'
 *              name : Название транспорта, например 'the airport bus' или 'the bus 23' (в случае автобуса) или номер маршрута (в случае поезда)
 *      3.2.2) flight имеют свойства:
 *              seat : Номер места в салоне, записывается в виде 'Seat 5A'
 *              name : Номер рейса
 *              gate : Номер выхода
 *              baggage : Условия перевозки багажа, записывается в виде 'drop at ticket counter ...' или 'will be automatically transferred from your last leg'
 *
 * Чтобы работать со всеми карточками, их необходимо предварительно положить в массив
 *
 *
 * Методы, которые предоставляет данное API:
 *
 * 1) API.showCard(id, item) - показывает объект в виде карточки на странице
 *      id - название идентификатора в DOM, в который необходимо отобразить карточку (если такого идентификатора нет на странице, то в body добавится div с указанным идентификатором)
 *      item - название карточки, которую нужно показать
 *
 * 2) API.showAllCards(id, array) - показывает все объекты из массива в виде списка карточек на странице
 *      id - название идентификатора в DOM, в который необходимо отобразить карточки (если такого идентификатора нет на странице, то в body добавится div с указанным идентификатором)
 *      array - массив из карточек, которые необходимо отобразить на странице
 *
 * 3) API.sort(array) - сортирует карточки в массиве в правильном порядке и возвращает отсортированный массив
 *      array - массив из карточек, которые необходимо отсортировать
 *
 * 4) API.shuffle(array) - перемешивает карточки в массиве произвольным образом и возвращает перемешанный массив
 *      array - массив из карточек, которые необходимо перемешать
 *
 * 5) API.showWay(id, array) - отображает список-инструкцию на странице, которая показывает как добраться из пункта отправления первого элемента массива в пункт назначения последнего элемента массива (для корректного составления инструкции необходжимо подать в качестве второго аргумента предварительно отсортированный массив)
 *      id - название идентификатора в DOM, в который необходимо отобразить путь (если такого идентификатора нет на странице, то в body добавится div с указанным идентификатором)
 *      array - массив из карточек, для которых нужно отобразить инструкцию на странице
 *
 * 6) API.consoleWay(array) - отображает список-инструкцию в консоли, работает аналогично API.showWay(id, array)
 *      array - массив из карточек, для которых нужно отобразить инструкцию в консоли
 *
 * 7) API.addCard(destination, transport) - добавляет новую карточку (работает только после вызова функции сортировки, потому что добавляет карточку в конец массива, то есть пунктом отправления у нее будет последний понкт назначения), возвращаяет созданную карточку в виде объекта
 *      destination - новый пункт назначения
 *      transport - объект со свойствами, о которых бало сказано выше, например { type: 'train', name: 'S5', seat: 'Seat 43D'}
 *
 *
 * Чтобы добавить новый тип транспорта, или дополнительные свойства в уже имеющиеся типы транспорта необходимо:
 *
 * 1) в метод show конструктора Transport добавить case с обработкой нового типа транспорта или свойства а также написание инструкции для него
 * 2) в метод addCard добавить возможность создания объекта с новыми свойствами
 * 3) в метод showCard добавить возможность вывода карточки на экран с новыми свойствами
 *
 *
 */
var API = (function () {
    // Введем переменную, в которую будем записывать пункт назначения после сортировки карточек
    var lastPoint;

    // Это внутренняя функция, которая помогает найти карточку с указанным пунктом отправления или прибытия в зависимости от параметра prop (используется в функции сортировки)
    var _find = function (prop, array, what) {
        if (prop == 'from') {
            for (var i = 0; i < array.length; i++) {
                if (array[i].from == what)
                    return array[i];
            }
        } else if (prop == 'to')
            for (var j = 0; j < array.length; j++) {
                if (array[j].to == what)
                    return array[j];
            }
    };

    // Это внутренняя функция, которая помогает очистить элемент dom перед записью
    var _clear = function (inner) {
        inner.innerHTML = '';
    };

    // Это функция, которая показывает объект в виде карточки на странице
    var showCard = function (id, item) {
        if (!document.getElementById(id)) {
            var response = document.createElement('div');
            response.setAttribute('id', id);
            document.body.appendChild(response);
        } else {
            var response = document.getElementById(id);
        }
        var div = document.createElement('div');
        response.appendChild(div);
        div.style.border = "1px solid #0000FF";
        div.style.margin = "11px";
        div.style.display = "inline-block";
        div.style.verticalAlign = "top";
        var transport = item.transport;
        if (transport.type.toLowerCase() == 'train' || transport.type.toLowerCase() == 'bus') {
            div.innerHTML = '<b> From: </b>' + item.from + '<br /><b> To: </b>' + item.to + '<br /><i> Transport: </i>' + transport.type.toUpperCase() + '<br /><i> Number: </i>' + transport.name + '. ' + transport.seat;
        } else if (transport.type.toLowerCase() == 'flight') {
            div.innerHTML = '<b> From: </b>' + item.from + '<br /><b> To: </b>' + item.to + '<br /><i> Transport: </i>' + transport.type.toUpperCase() + '<br /><i> Number: </i>' + transport.name + '. ' + transport.seat + '<br /><i> Gate: </i>' + transport.gate + '. Baggage ' + transport.baggage;
        }
    };

    // Это функция, которая показывает все объекты из массива в виде списка карточек на странице
    var showAllCards = function (id, array) {
        for (var i = 0; i < array.length; i++)
            API.showCard(id, array[i]);
    };

    // Это функция, которая может отсортировать карточки в массиве в правильном порядке
    var sort = function (array) {
        var newArray = [array[0]];
        for (var i = 0; i < array.length - 1; i++) {
            if (newArray[i])
                newArray.push(_find('from', array, newArray[i].to));
        }
        if (!newArray[newArray.length - 1]) newArray.pop();
        var length = newArray.length;
        lastPoint = newArray[newArray.length - 1].to;
        if (length == array.length) {
            return newArray;
        } else {
            for (var j = 0; j < array.length - length; j++) {
                newArray.unshift(_find('to', array, newArray[0].from));
            }
            return newArray;
        }
    };

    // Это функция, которая может перемешать карточки в массиве произвольным образом
    var shuffle = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var num = Math.floor(Math.random() * (i + 1));
            var d = array[num];
            array[num] = array[i];
            array[i] = d;
        }
        return array;
    };

    // Это функция, которая может добавить новую карточку (работает только после вызова функции сортировки, потому что добавляет карточку в конец массива, то есть пунктом отправления у нее будет последний понкт назначения)
    var addCard = function (destination, transport) {
        if (transport.type.toLowerCase() == 'train' || transport.type.toLowerCase() == 'bus') {
            var newCard = new Object({
                to: destination,
                from: lastPoint,
                transport: {
                    type: transport.type,
                    name: transport.name,
                    seat: transport.seat
                }
            })
        } else if (transport.type.toLowerCase() == 'flight') {
            var newCard = new Object({
                to: destination,
                from: lastPoint,
                transport: {
                    type: transport.type,
                    name: transport.name,
                    seat: transport.seat,
                    gate: transport.gate,
                    baggage: transport.baggage
                }
            })
        }
        return newCard;
    };

    // Это функция, которая отображает список-инструкцию в консоли
    var consoleWay = function (array) {
        for (var i = 0; i < array.length; i++) {
            console.log(new Transport(array[i].transport, array[i].from, array[i].to).show);
        }
    };

    // Это функция, которая отображает список-инструкцию на странице
    var showWay = function (id, array) {
        if (!document.getElementById(id)) {
            var response = document.createElement('div');
            response.setAttribute('id', id);
            document.body.appendChild(response);
        } else {
            var response = document.getElementById(id);
            _clear(response);
        }
        for (var i = 0; i < array.length; i++) {
            var li = document.createElement('li');
            response.appendChild(li);
            li.innerText = new Transport(array[i].transport, array[i].from, array[i].to).show;
        }

    };

    //Конструктор, который формирует инструкцию для каждого типа транспорта, используя внутренние свойства
    function Transport(params, from, to) {
        this.name = params.name;
        this.seat = params.seat;
        this.gate = params.gate;
        this.baggage = params.baggage;
        switch (params.type.toLowerCase()) {
            case('train'):
                this.show = 'Take train ' + this.name + ' from ' + from + ' to ' + to + '. ' + this.seat + '.';
                break;
            case('flight'):
                this.show = 'From ' + from + ', take flight ' + this.name + ' to ' + to + '. Gate ' + this.gate + '. ' + this.seat + '. Baggage ' + this.baggage + '.';
                break;
            case('bus'):
                this.show = 'Take ' + this.name + ' from ' + from + ' to ' + to + '. ' + this.seat + '.';
                break;
            default:
                this.show = console.log('error in type of transport');
        }
    }
    // Предоставляемые методы
    return {
        sort: sort,
        showWay: showWay,
        consoleWay: consoleWay,
        shuffle: shuffle,
        showCard: showCard,
        addCard: addCard,
        showAllCards: showAllCards
    };
})();

