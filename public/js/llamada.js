var trueconnected = 0,
  subscripted = 0,
  falseconnected = 0,
  reenviar = 0,
  esperaParaReenviar = 0;
let mqttreceived = null,
  modo_automatico = null;
var mqttsend = 1;
var mqttcommand = '{"enviar_datos_completos":1}';
let data = false;
let horariosDispositivo = null;
const device_address =
  window.location.pathname.replace(/\/$/, "").split("/").pop() ||
  "c4d7ba3a7d80";
firstBoot = 1;
//colorea valvula
function colorea_valvula(estado, valvula) {
  //console.log(estado);
  //console.log(valvula);
  switch (estado) {
    case 1:
      //console.log("coloreando" + String(valvula) + "on");
      document.getElementById("val" + String(valvula)).src =
        "../img/modo-valvula-activa.png";
      document.getElementById("val" + String(valvula)).alt = "1";

      break;

    case 0:
      //console.log("coloreando" + String(valvula) + "off");
      document.getElementById("val" + String(valvula)).src =
        "../img/modo-valvula-inactiva.png";
      document.getElementById("val" + String(valvula)).alt = "0";
      break;

    default:
      break;
  }
}

function proximo_encendido(datos) {
  if ((horariosDispositivo = !null)) {
    var proximoEncendido = datos;
    var horaProx = parseInt(
      proximoEncendido.substring(0, proximoEncendido.indexOf(":"))
    );
    var minProx = parseInt(
      proximoEncendido.substring(
        proximoEncendido.indexOf(":") + 1,
        proximoEncendido.indexOf(" ")
      )
    );
    var diaProx = proximoEncendido.substring(
      proximoEncendido.indexOf(" ") + 1,
      proximoEncendido.indexOf(" ") + 3
    );
    var amPm = "am";
    if (horaProx == 0) {
      horaProx = 12;
    } else if (horaProx == 12) {
      amPm = "pm";
    }
    if (horaProx > 12) {
      horaProx = horaProx - 12;
      amPm = "pm";
    }
    var proximoEncendidoAux = `${horaProx}:`;
    if (horaProx < 10) {
      proximoEncendidoAux = `0${horaProx}:`;
    }
    if (minProx < 10) {
      proximoEncendidoAux += `0${minProx}`;
    } else {
      proximoEncendidoAux += `${minProx}`;
    }

    document.getElementById(
      "countdown"
    ).innerHTML = `${proximoEncendidoAux} ${amPm} ${diaProx}`;
  }
}
function modo_activo(modo) {
  if (modo != null) {
    modo_automatico = modo;
  }
  //id="modo"
  if (modo_automatico == 1) {
    document.getElementById("modo").innerHTML = "Automatico";
    document.getElementById("autom").innerHTML =
      '<span class="icon automatico"></span><strong>Automatico</strong>';
    document.getElementById("manualv").innerHTML =
      '<span class="icon manual"></span>Manual';
    for (let i = 1; i < 5; i++) {
      document.getElementById("val" + String(i)).class = "manual-toggle";
    }
  }
  if (modo_automatico == 0) {
    //icon apagado
    document.getElementById("modo").innerHTML = "Manual";
    document.getElementById("autom").innerHTML =
      '<span class="icon automatico"></span>Automatico';
    document.getElementById("manualv").innerHTML =
      '<span class="icon apagado"></span><strong>Manual</strong>';
  }
}
function horariosActivos(horariosRecibidos) {
  //console.log('procesando horarios');
  if (horariosRecibidos != null) {
    horariosDispositivo = horariosRecibidos;
    //console.log(horariosDispositivo);
  }
}

//procesar dato recibido
function procesardatorecibido(dato) {
  //se llama en momento de recepcion de datos validos app.js
  ///procesar cambios de valvulas
  let procesarAlerta = false;
  if (dato.estado_valvulas != null) {
    mqttsend = 0;
    //console.log('cambiaron las valvulas');
    //console.log(dato.estado_valvulas);
    for (let i = 1; i < 5; i++) {
      colorea_valvula(dato.estado_valvulas[i - 1], i);
    }
    procesarAlerta = true;
  } //////////procesar cambio de modo
  if (dato.modo_activo != null) {
    mqttsend = 0;
    //console.log('cambió el modo de operación');
    modo_activo(dato.modo_activo);
    //console.log(dato.modo_activo);

    procesarAlerta = true;
  } /////procesar cambio de próximo horario
  if (dato.proximo_ciclo != null) {
    mqttsend = 0;
    //console.log('cambió proximo ciclo');
    //console.log(dato.proximo_ciclo);
    proximo_encendido(dato.proximo_ciclo);
    procesarAlerta = true;
  }
  if (dato.horarios != null) {
    mqttsend = 0;
    //console.log(dato.horarios);
    horariosActivos(dato.horarios);
    procesarAlerta = true;
  }
  if (procesarAlerta) {
    mqttsend = 0;
    // $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');
    // $("#respuesta").html('Dispositivo Sincronizado.'); //icon-comm
    // setTimeout(function () {
    //     $('#respuesta').fadeOut(1000);//$('#respuesta').alert('close');
    // }, 10000);
    document.querySelector(`#icon-comm`).classList.remove("sincro"); //jscript nativo

    document.querySelector(`#icon-comm`).classList.add("connectsuccess");

    procesarAlerta = 0;
    falseconnected = 0;
    esperaParaReenviar = 0;
  }
}

///////
$("document").ready(function () {
  $("body").append(
    '<div id="overlay" class="modal-overlay" style="display: none;"></div>'
  );
  /*$(document).ajaxStart(function(){
        $("#overlay").fadeIn();

    });

    $(document).ajaxComplete(function(){
        $("#overlay").fadeOut();
    });*/

  //console.log(websocketclient.connected);
  if (websocketclient.connected == true) {
    if (trueconnected++ == 10) {
      trueconnected = 10;
    }
  }
  var timeout = 0;
  if (websocketclient.connected == false) {
    //websocketclient.disconnect();
    //$('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');
    //$("#respuesta").html('Conectando con broker MQTT...');
    // websocketclient.connect();
    // while (websocketclient.connected == false) {
    //     if (timeout++ == 999999999) {
    //         //console.log('timeout!!');
    //         timeout = 0;
    //         break;
    //     }
    // }
  }
  //console.log(websocketclient.connected);
  if (websocketclient.connected == true) {
    if (trueconnected++ == 10) {
      trueconnected = 10;
    }
  }
  function toTimestamp(year, month, day, hour, minute, second) {
    var datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() / 1000;
  }
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var sec = date.getSeconds();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    sec = sec < 10 ? "0" + sec : sec;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  // reloj
  function hora() {
    let hour = new Date();

    document.getElementById("timer").innerHTML = formatAMPM(hour);
    //document.getElementById("autom").innerHTML = "<strong>Automatico</strong>";
    // $('#autom').html("<span class=\"icon automatico\"></span><strong>Automatico</strong>");

    /*
       $.ajax({
           type:'post',
           url:'inc/tiempo.php',
           success:function($hora){
               $('#timer').html($hora);

           }
       });
       */
  }
  // hora();
  var timeHora = setInterval(function () {
    hora();
  }, 1000);
  var modoaux;
  var modoop;
  function hora1() {
    /*
        $.ajax({
            type:'post',
            url:'inc/modo.php',
            success:function($modos){
                $('#modo').html($modos);
                modoaux=$modos;
            }
        });
        */
  }
  //hora1();
  var timeHora1 = setInterval(function () {
    hora1();
  }, 1000);
  /*
    function hora2() {
        if (modoop != modoaux) {
            modoop = modoaux;
            $.ajax({
                type: 'post',
                url: 'inc/menu.php',
                success: function ($menu) {
                    $('#menu').html($menu);

                }
            });

        }

    }
    //hora2();
    var timeHora2 = setInterval(function () {
        hora2();
    }, 1000);
    */
  //apagar  valvulas
  function apagar_valvs() {}

  //countdown
  function countdown() {
    //console.log("connected status:");
    //console.log(websocketclient.connected);
    if (firstBoot == 1 && falseconnected == 1) {
      firstBoot = 0;
      if (websocketclient.connected == false) {
        //websocketclient.disconnect();
        websocketclient.connect();
        var timeout3 = 0;
        while (websocketclient.connected == false) {
          if (timeout3++ == 999999999) {
            //console.log('timeout!!');
            timeout3 = 0;
            break;
          }
        }
      }
    }

    console.log("connected to id " + device_address);
    if (
      websocketclient.connected == true &&
      trueconnected > 0 &&
      subscripted == 0
    ) {
      // $("#respuesta").html('connecting...');

      //$('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');
      //$("#respuesta").html('Sincronizando dispositivo...');
      document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

      document.querySelector(`#icon-comm`).classList.add("sincro");
      //console.log('enviando mqtt subscribe');
      // websocketclient.subscribe("SDR/c4d7ba3a7d80/out", parseInt(0, 10), -1);
      websocketclient.subscribe(
        "SDR/" + device_address + "/out",
        parseInt(0, 10),
        -1
      );

      //mqttsend = 0;

      //mqttcommand = '';
      falseconnected = 0;
    }
    if ((mqttsend == 1 || reenviar == 1) && subscripted == 1) {
      //console.log("aqui");
      //console.log(websocketclient.connected);
      if (websocketclient.connected == true) {
        if (trueconnected++ == 10) {
          trueconnected = 10;
        }
      }
      //console.log(trueconnected);
      if (websocketclient.connected == true && trueconnected > 0) {
        // $("#respuesta").html('connecting...');
        //console.log('enviando mqtt publish');
        /*         websocketclient.publish(
          "SDR/c4d7ba3a7d80/in",
          mqttcommand,
          parseInt(0, 10),
          false
        ); */
        websocketclient.publish(
          "SDR/" + device_address + "/in",
          mqttcommand,
          parseInt(0, 10),
          false
        );
        //mqttsend = 0;
        falseconnected = 0;
      }
    } else if (websocketclient.connected == true) {
      //console.log(mqttreceived);

      if (trueconnected++ > 10) {
        trueconnected = 10;
      }
    } else if (websocketclient.connected == false) {
      if (falseconnected == 5) {
        var timeout2 = 0;
        if (websocketclient.connected == false) {
          //websocketclient.disconnect();
          websocketclient.connect();
          // while (websocketclient.connected == false) {
          //     if (timeout2++ == 999999999) {
          //         //console.log('timeout!!');
          //         timeout2 = 0;
          //         break;
          //     }

          // }
        }
      }
      if (falseconnected++ > 20) {
        let para = document.createElement("P");

        para.innerHTML =
          "No se ha logrado comunicación con el dispositivo, revise su conexión a internet, si el error persiste puede contactar al área de Soporte Orbittas.";

        swal({
          title: "Error B-001",
          content: para,
          //text: '  No se ha logrado la comunicación con el broker MQTT.     Si el error persiste puede contactar al area de soporte. ',
          buttons: {
            Reintentar: true,
          },
          // className: 'swal2-overflow',
          icon: "error",
        }).then(function (result) {
          if (result) {
            falseconnected = 0;
            var timeout2 = 0;
            if (websocketclient.connected == false) {
              //websocketclient.disconnect();
              websocketclient.connect();
              // while (websocketclient.connected == false) {
              //     if (timeout2++ == 999999999) {
              //         //console.log('timeout!!');
              //         timeout2 = 0;
              //         break;
              //     }

              // }
            }
          }
        });
        //let alerta1 = new ErrorComunicacion('Error B-001');

        //alerta1.errorComunicacion(); //si se presiona reintentar en la alerta se ejecuta el reintento
      }
    }
    if (mqttsend == 2) {
      //enviado y sin respuesta
      if (esperaParaReenviar++ > 10) {
        let parra = document.createElement("P");

        parra.innerHTML =
          "No se ha logrado comunicación con el dispositivo, revise su conexión a internet, si el error persiste puede contactar al área de Soporte Orbittas.";

        swal({
          title: "Error D-001",
          content: parra,
          //text: '  No se ha logrado la comunicación con el broker MQTT.     Si el error persiste puede contactar al area de soporte. ',
          buttons: {
            Reintentar: true,
          },
          // className: 'swal2-overflow',
          icon: "error",
        }).then(function (result) {
          if (result) {
            esperaParaReenviar = 0;
            mqttsend = 1;
          } else {
            esperaParaReenviar = 0;
            mqttsend = 0;
          }
        });
        esperaParaReenviar = 0;
      }
    }
  }
  //countdown();
  var timeContador = setInterval(function () {
    countdown();
  }, 1000);

  //bloqueo de forms
  $("#blocked1").find(" textarea,select,input").prop("disabled", true);
  $("#blocked2").find(" textarea,select,input").prop("disabled", true);
  $("#blocked3").find(" textarea,select,input").prop("disabled", true);
  $("#blocked4").find(" textarea,select,input").prop("disabled", true);
  $("#blocked5").find(" textarea,select,input").prop("disabled", true);
  $("#blocked6").find(" textarea,select,input").prop("disabled", true);
  $("#blocked7").find(" textarea,select,input").prop("disabled", true);
  $("#blocked8").find(" textarea,select,input").prop("disabled", true);

  //desbloqueo de forms segun botones
  $("#contenido").on("click", "#editar1", function (event) {
    event.preventDefault();
    $("#blocked1").find("input,textarea,select").prop("disabled", false);
    $("#editar1").prop("disabled", true);
    // $("#activar1").text("Aceptar horario");
  });

  $("#contenido").on("click", "#editar2", function (event) {
    event.preventDefault();
    $("#blocked2").find("input,textarea,select").prop("disabled", false);
    $("#editar2").prop("disabled", true);
    //  $("#activar2").text("Aceptar horario");
  });
  $("#contenido").on("click", "#editar3", function (event) {
    event.preventDefault();
    $("#blocked3").find("input,textarea,select").prop("disabled", false);
    $("#editar3").prop("disabled", true);
    //  $("#activar3").text("Aceptar horario");
  });
  $("#contenido").on("click", "#editar4", function (event) {
    event.preventDefault();
    $("#blocked4").find("input,textarea,select").prop("disabled", false);
    $("#editar4").prop("disabled", true);
    // $("#activar4").text("Aceptar horario");
  });

  $("#contenido").on("click", "#editar5", function (event) {
    event.preventDefault();
    $("#blocked5").find("input,textarea,select").prop("disabled", false);
    $("#editar5").prop("disabled", true);
    //  $("#activar2").text("Aceptar horario");
  });
  $("#contenido").on("click", "#editar6", function (event) {
    event.preventDefault();
    $("#blocked6").find("input,textarea,select").prop("disabled", false);
    $("#editar6").prop("disabled", true);
    //  $("#activar3").text("Aceptar horario");
  });
  $("#contenido").on("click", "#editar7", function (event) {
    event.preventDefault();
    $("#blocked7").find("input,textarea,select").prop("disabled", false);
    $("#editar7").prop("disabled", true);
    // $("#activar4").text("Aceptar horario");
  });
  $("#contenido").on("click", "#editar8", function (event) {
    event.preventDefault();
    $("#blocked8").find("input,textarea,select").prop("disabled", false);
    $("#editar8").prop("disabled", true);
    // $("#activar1").text("Aceptar horario");
  });
  // visualizacion modo automatico
  var horario = $("#horarios").val();
  $("#modulo-1").addClass("d-none");
  $("#horar1").fadeOut("fast");
  $("#horar1").addClass("hide");
  $("#horar2").fadeOut("fast");
  $("#horar2").addClass("hide");
  $("#horar3").fadeOut("fast");
  $("#horar3").addClass("hide");
  $("#horar4").fadeOut("fast");
  $("#horar4").addClass("hide");
  $("#horar5").fadeOut("fast");
  $("#horar5").addClass("hide");
  $("#horar6").fadeOut("fast");
  $("#horar6").addClass("hide");
  $("#horar7").fadeOut("fast");
  $("#horar7").addClass("hide");
  $("#horar8").fadeOut("fast");
  $("#horar8").addClass("hide");

  $("#horarios").change(function () {
    horario = $(this).val();
    $("#modulo-1").removeClass("d-none");
    $('[href="#modulo-1"]').tab("show");
    $("#activar1").prop("disabled", false);
    $("#horar1").fadeIn("fast");
    $("#horar1").removeClass("hide");
    $("#horar2").fadeOut("fast");
    $("#horar2").addClass("hide");
    $("#horar3").fadeOut("fast");
    $("#horar3").addClass("hide");
    $("#horar4").fadeOut("fast");
    $("#horar4").addClass("hide");
    $("#horar5").fadeOut("fast");
    $("#horar5").addClass("hide");
    $("#horar6").fadeOut("fast");
    $("#horar6").addClass("hide");
    $("#horar7").fadeOut("fast");
    $("#horar7").addClass("hide");
    $("#horar8").fadeOut("fast");
    $("#horar8").addClass("hide");

    if (horario == 0) {
      $("#modulo-1").addClass("d-none");
      $("#activar1").prop("disabled", false);
      $("#horar1").fadeOut("fast");
      $("#horar1").addClass("hide");
      $("#activar2").prop("disabled", false);
      $("#horar2").fadeOut("fast");
      $("#horar2").addClass("hide");
      $("#activar3").prop("disabled", false);
      $("#horar3").fadeOut("fast");
      $("#horar3").addClass("hide");
      $("#activar4").prop("disabled", false);
      $("#horar4").fadeOut("fast");
      $("#horar4").addClass("hide");
      $("#activar5").prop("disabled", false);
      $("#horar5").fadeOut("fast");
      $("#horar5").addClass("hide");
      $("#activar6").prop("disabled", false);
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#activar7").prop("disabled", false);
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#activar8").prop("disabled", false);
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }

    if (horario == 1) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Activar Horario");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#horar2").fadeOut("fast");
      $("#horar2").addClass("hide");
      $("#horar3").fadeOut("fast");
      $("#horar3").addClass("hide");
      $("#horar4").fadeOut("fast");
      $("#horar4").addClass("hide");
      $("#horar5").fadeOut("fast");
      $("#horar5").addClass("hide");
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 2) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Activar Horario");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#horar3").fadeOut("fast");
      $("#horar3").addClass("hide");
      $("#horar4").fadeOut("fast");
      $("#horar4").addClass("hide");
      $("#horar5").fadeOut("fast");
      $("#horar5").addClass("hide");
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 3) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Activar Horario");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#horar4").fadeOut("fast");
      $("#horar4").addClass("hide");
      $("#horar5").fadeOut("fast");
      $("#horar5").addClass("hide");
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 4) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Siguiente");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#activar4").prop("disabled", false);
      $("#activar4").text("Activar Horario");
      $("#horar4").fadeIn("fast");
      $("#horar4").removeClass("hide");
      $("#horar5").fadeOut("fast");
      $("#horar5").addClass("hide");
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 5) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Siguiente");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#activar4").prop("disabled", false);
      $("#activar4").text("Siguiente");
      $("#horar4").fadeIn("fast");
      $("#horar4").removeClass("hide");
      $("#activar5").prop("disabled", false);
      $("#activar5").text("Activar Horario");
      $("#horar5").fadeIn("fast");
      $("#horar5").removeClass("hide");
      $("#horar6").fadeOut("fast");
      $("#horar6").addClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 6) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Siguiente");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#activar4").prop("disabled", false);
      $("#activar4").text("Siguiente");
      $("#horar4").fadeIn("fast");
      $("#horar4").removeClass("hide");
      $("#activar5").prop("disabled", false);
      $("#activar5").text("Siguiente");
      $("#horar5").fadeIn("fast");
      $("#horar5").removeClass("hide");
      $("#activar6").prop("disabled", false);
      $("#activar6").text("Activar Horario");
      $("#horar6").fadeIn("fast");
      $("#horar6").removeClass("hide");
      $("#horar7").fadeOut("fast");
      $("#horar7").addClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 7) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Siguiente");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#activar4").prop("disabled", false);
      $("#activar4").text("Siguiente");
      $("#horar4").fadeIn("fast");
      $("#horar4").removeClass("hide");
      $("#activar5").prop("disabled", false);
      $("#activar5").text("Siguiente");
      $("#horar5").fadeIn("fast");
      $("#horar5").removeClass("hide");
      $("#activar6").prop("disabled", false);
      $("#activar6").text("Siguiente");
      $("#horar6").fadeIn("fast");
      $("#horar6").removeClass("hide");
      $("#activar7").prop("disabled", false);
      $("#activar7").text("Activar Horario");
      $("#horar7").fadeIn("fast");
      $("#horar7").removeClass("hide");
      $("#horar8").fadeOut("fast");
      $("#horar8").addClass("hide");
    }
    if (horario == 8) {
      $("#modulo-1").removeClass("d-none");
      $('[href="#modulo-1"]').tab("show");
      $("#activar1").prop("disabled", false);
      $("#activar1").text("Siguiente");
      $("#horar1").fadeIn("fast");
      $("#horar1").removeClass("hide");
      $("#activar2").prop("disabled", false);
      $("#activar2").text("Siguiente");
      $("#horar2").fadeIn("fast");
      $("#horar2").removeClass("hide");
      $("#activar3").prop("disabled", false);
      $("#activar3").text("Siguiente");
      $("#horar3").fadeIn("fast");
      $("#horar3").removeClass("hide");
      $("#activar4").prop("disabled", false);
      $("#activar4").text("Siguiente");
      $("#horar4").fadeIn("fast");
      $("#horar4").removeClass("hide");
      $("#activar5").prop("disabled", false);
      $("#activar5").text("Siguiente");
      $("#horar5").fadeIn("fast");
      $("#horar5").removeClass("hide");
      $("#activar6").prop("disabled", false);
      $("#activar6").text("Siguiente");
      $("#horar6").fadeIn("fast");
      $("#horar6").removeClass("hide");
      $("#activar7").prop("disabled", false);
      $("#activar7").text("Siguiente");
      $("#horar7").fadeIn("fast");
      $("#horar7").removeClass("hide");
      $("#activar8").prop("disabled", false);
      $("#activar8").text("Activar Horario");
      $("#horar8").fadeIn("fast");
      $("#horar8").removeClass("hide");
    }
  });
  $("#horarios").trigger("change");
  //graficas

  // var highchartLabelButtons = [{ type: 'month', count: 1, text: '1M' }, { type: 'month', count: 3, text: '3M' }, { type: 'month', count: 6, text: '6M' }, { type: 'ytd', text: 'Año' }, { type: 'year', count: 1, text: '1A' }, { type: 'all', text: 'Todo' }];
  // var seriesOptions = [];
  // var seriesCounter = 0,
  //     namesSeries = [];
  // Highcharts.setOptions({
  //     lang: {
  //         loading: 'Cargando...',
  //         months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  //         weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  //         shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  //         exportButtonTitle: "Exportar",
  //         printButtonTitle: "Importar",
  //         rangeSelectorFrom: "Desde",
  //         rangeSelectorTo: "Hasta",
  //         rangeSelectorZoom: "Período",
  //         downloadPNG: 'Descargar imagen PNG',
  //         downloadJPEG: 'Descargar imagen JPEG',
  //         downloadPDF: 'Descargar imagen PDF',
  //         downloadSVG: 'Descargar imagen SVG',
  //         printChart: 'Imprimir',
  //         resetZoom: 'Reiniciar zoom',
  //         resetZoomTitle: 'Reiniciar zoom',
  //         thousandsSep: ",",
  //         decimalPoint: '.'
  //     }
  // });
  // /**
  //  * Create the chart when all data is loaded
  //  * @returns {undefined}0
  //  */

  // // Set the datepicker's date format
  // $.datepicker.setDefaults({
  //     dateFormat: 'yy-mm-dd',
  //     onSelect: function () {
  //         this.onchange();
  //         this.onblur();
  //     }
  // });

  // //validar tiempos de cada zona
  // $("input[type=number]").change(function () {
  //     var max = parseInt($(this).attr('max'));
  //     var min = parseInt($(this).attr('min'));
  //     if ($(this).val() > max) {
  //         $(this).val(max);
  //     }
  //     else if ($(this).val() < min) {
  //         $(this).val(min);
  //     }
  // });

  // modo automatico
  $("#contenido").on("click", "#activar1", function () {
    if ($("#activar1").text().indexOf("Activar") == -1) {
      $('[href="#modulo-2"]').tab("show");
      return false;
    }

    activar_horarios();
  });

  $("#contenido").on("click", "#activar2", function () {
    if ($("#activar2").text().indexOf("Activar") == -1) {
      $('[href="#modulo-3"]').tab("show");
      return false;
    }

    activar_horarios();
  });
  $("#contenido").on("click", "#activar3", function () {
    if ($("#activar3").text().indexOf("Activar") == -1) {
      $('[href="#modulo-4"]').tab("show");
      return false;
    }
    activar_horarios();
  });

  $("#contenido").on("click", "#activar4", function () {
    if ($("#activar4").text().indexOf("Activar") == -1) {
      $('[href="#modulo-5"]').tab("show");
      return false;
    }
    activar_horarios();
  });
  $("#contenido").on("click", "#activar5", function () {
    if ($("#activar5").text().indexOf("Activar") == -1) {
      $('[href="#modulo-6"]').tab("show");
      return false;
    }
    activar_horarios();
  });
  $("#contenido").on("click", "#activar6", function () {
    if ($("#activar6").text().indexOf("Activar") == -1) {
      $('[href="#modulo-7"]').tab("show");
      return false;
    }
    activar_horarios();
  });
  $("#contenido").on("click", "#activar7", function () {
    if ($("#activar7").text().indexOf("Activar") == -1) {
      $('[href="#modulo-8"]').tab("show");
      return false;
    }
    activar_horarios();
  });
  $("#contenido").on("click", "#activar8", function () {
    activar_horarios();
  });
  function activar_horarios() {
    let numeroHorarios = parseInt($("#horarios").val());

    var tiempo = [];
    var tiempofin = [];
    let salta = false;

    for (let index = 0; index < numeroHorarios; index++) {
      tiempo[index] = toTimestamp(
        1970,
        1,
        1,
        $(`#hora${index + 1}`).val(),
        $(`#min${index + 1}`).val(),
        0
      );
      tiempofin[index] = toTimestamp(
        1970,
        1,
        1,
        $(`#horaFin${index + 1}`).val(),
        $(`#minFin${index + 1}`).val(),
        0
      );
    }
    tiempo.forEach((element, index) => {
      //console.log(`${element}:${tiempofin[index]}`);
      if (element === tiempofin[index]) {
        swal(
          "Horario inválido",
          `El horario de inicio debe ser anterior al horario final en Ciclo ${
            index + 1
          }`,
          "error"
        ); ///sweet alert //https://sweetalert.js.org/guides/
        salta = true;
        return false;
      }
    });

    if (!salta) {
      var intval = [0, 0, 0, 0, 0, 0, 0, 0]; //arreglo de enteros que replesentan las valvulas a activarse por horario
      var intdias = [0, 0, 0, 0, 0, 0, 0, 0]; //arreglo de enteros que representan los días activados para cada horario
      $(".zone2 *:checkbox").each(function () {
        if ($(this).prop("checked") == true) {
          var id = $(this).attr("id");
          //console.log('id:');
          //console.log(id);
          var clase = $(this).attr("class");
          switch (clase) {
            case "uno1":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 1;
                }
                if (id.includes(`v${index + 1}`)) {
                  intval[index] = intval[index] + 1;
                }
              }
              break;
            case "dos2":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 2;
                }
                if (id.includes(`v${index + 1}`)) {
                  intval[index] = intval[index] + 2;
                }
              }
              break;
            case "tres3":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 4;
                }
                if (id.includes(`v${index + 1}`)) {
                  intval[index] = intval[index] + 4;
                }
              }
              break;
            case "cuatro4":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 8;
                }
                if (id.includes(`v${index + 1}`)) {
                  intval[index] = intval[index] + 8;
                }
              }
              break;
            case "cinco5":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 16;
                }
              }
              break;
            case "seis6":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 32;
                }
              }
              break;
            case "siete7":
              for (let index = 0; index < numeroHorarios; index++) {
                ///verifica si el checkbox esta activado para asignar el valor de intdías
                if (id.includes(`d${index + 1}`)) {
                  intdias[index] = intdias[index] + 64;
                }
              }
              break;
          }
        }
      });
      let horario = [];
      horario[0] = numeroHorarios;
      let horaAuxEnv;
      let horaFinAuxEnv;
      let amPmAuxEnv;
      for (let index = 0; index < numeroHorarios; index++) {
        horaAuxEnv = parseInt($("#hora" + String(index + 1)).val());
        amPmAuxEnv = $("#hor" + String(index + 1)).val();
        if (amPmAuxEnv === "pm") {
          if (horaAuxEnv < 12) {
            horaAuxEnv += 12;
          }
        } else if (amPmAuxEnv === "am") {
          if (horaAuxEnv === 12) {
            horaAuxEnv = 0;
          }
        }
        amPmAuxEnv = "";
        horaFinAuxEnv = parseInt($("#horaFin" + String(index + 1)).val());
        amPmAuxEnv = $("#horfin" + String(index + 1)).val();
        if (amPmAuxEnv === "pm") {
          if (horaFinAuxEnv < 12) {
            horaFinAuxEnv += 12;
          }
        } else if (amPmAuxEnv === "am") {
          if (horaFinAuxEnv === 12) {
            horaFinAuxEnv = 0;
          }
        }
        horario[6 * index + 1] = horaAuxEnv;
        horario[6 * index + 2] = parseInt($("#min" + String(index + 1)).val());
        horario[6 * index + 3] = horaFinAuxEnv;
        horario[6 * index + 4] = parseInt(
          $("#minFin" + String(index + 1)).val()
        );
        horario[6 * index + 5] = intdias[index];
        horario[6 * index + 6] = intval[index];
      }
      //console.log(horario);
      mqttcommand = "";
      mqttcommand = `horarios,${horario},`;
      //console.log(mqttcommand);
      mqttsend = 1;

      //$("#contenido").html(htmlexterno);
      for (let index = 0; index < numeroHorarios; index++) {
        $(`#blocked${index + 1}`)
          .find("input, textarea,select")
          .prop("disabled", true);

        $(`#editar${index + 1}`).prop("disabled", false);
      }
      document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

      document.querySelector(`#icon-comm`).classList.add("sincro");
      // $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');
      // $("#respuesta").html('Enviando Horarios...');
    }
  }

  $("#menu").on("click", "#manualv", function (event) {
    event.preventDefault();
    // modo_automatico = 0;
    // modo_activo(0);
    mqttcommand = "";
    mqttsend = 1;
    mqttcommand = '{"modo_activo":0}';
    document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

    document.querySelector(`#icon-comm`).classList.add("sincro");
    // $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');
    // $("#respuesta").html('Enviando Modo Manual...');
    // setTimeout(function () {
    //     $('#respuesta').fadeOut(1000);//$('#respuesta').alert('close');
    // }, 6000);
  });
  $("#menu").on("click", "#autom", function (event) {
    event.preventDefault();
    //console.log('mostrando horarios...');
    if (horariosDispositivo != null) {
      //console.log('calculando horarios...');
      var horario = horariosDispositivo;
      var horaAux = 12;
      var minAux = 0;
      var horaFinAux = 12;
      var minFinAux = 0;
      var diasAux = 0;
      var valAux = 0;
      var amPmAux = "am";
      var amPmAux2 = "am";
      var restaAux = 0;
      if (horario[0] != null) {
        $("#horarios").val(`${horario[0]}`);
        //console.log(`numero_horarios:${horario[0]}`);
      }
      $("#horarios").trigger("change");

      for (let index = 0; index < horario[0]; index++) {
        //hastala cantidad maxima de horarios elegidos
        if (horario[6 * index + 1] != null) {
          //console.log(`not null: ${horario[6 * index + 1]}`);
          $(`#modulo-${index + 1} .badge`).html("Activo");
          document
            .querySelector(`#modulo-${index + 1} .badge`)
            .classList.remove("badge-danger"); //jscript nativo
          // $(`#modulo-${index + 1} .badge`).removeClass('badge-danger');  ///jquery funciona
          document
            .querySelector(`#modulo-${index + 1} .badge`)
            .classList.add("badge-success");
          //$(`#modulo-${index + 1} .badge`).addClass('badge-success');

          //$('#hor1').val((formatAMPM(horario1).indexOf('pm') == -1 ? 'am' : 'pm'));
          horaAux = horario[6 * index + 1];
          minAux = horario[6 * index + 2];
          horaFinAux = horario[6 * index + 3];
          minFinAux = horario[6 * index + 4];
          diasAux = horario[6 * index + 5];
          valAux = horario[6 * index + 6];
          //console.log(`horaInicial:${horaAux}`);
          //console.log(`minInicial:${minAux}`);
          //console.log(`horaFinInicial:${horaFinAux}`);
          //console.log(`minFinInicial:${minFinAux}`);
          //console.log(`diasAux:${diasAux}`);
          //console.log(`valAux:${valAux}`);
          restaAux = 0;

          if (horaAux == 0) {
            horaAux = 12;
          } else if (horaAux == 12) {
            amPmAux = "pm";
          }
          if (horaAux > 12) {
            horaAux = horaAux - 12;
            amPmAux = "pm";
          }
          $(`#hora${index + 1}`).val(horaAux);
          $(`#min${index + 1}`).val(minAux);
          $(`#hor${index + 1}`).val(amPmAux);

          if (horaFinAux == 0) {
            horaFinAux = 12;
          } else if (horaFinAux == 12) {
            amPmAux2 = "pm";
          }
          if (horaFinAux > 12) {
            horaFinAux = horaFinAux - 12;
            amPmAux2 = "pm";
          }
          $(`#horaFin${index + 1}`).val(horaFinAux);
          $(`#minFin${index + 1}`).val(minFinAux);
          $(`#horfin${index + 1}`).val(amPmAux2);

          ////dias seleccionados
          // binAux = diasAux.toString(2);
          let decimalEnBinario = diasAux.toString(2); // A la base 2
          //console.log("El número decimal %s en binario es %s", diasAux, decimalEnBinario);
          let binAux = Array.from(decimalEnBinario);
          //console.log(binAux);
          for (let i = binAux.length; i > 0; i--) {
            if (binAux[i - 1] === "1") {
              document.getElementById(
                `radio-d${index + 1}-${binAux.length - i + 1}`
              ).checked = true;
            } else if (binAux[i - 1] === "0") {
              restaAux = restaAux + Math.pow(2, i);
              document.getElementById(
                `radio-d${index + 1}-${binAux.length - i + 1}`
              ).checked = false;
            }
          }
          decimalEnBinario = valAux.toString(2); // A la base 2
          //console.log("El número decimal %s en binario es %s", diasAux, decimalEnBinario);
          binAux = Array.from(decimalEnBinario);
          //console.log(binAux);

          ////valvulas seleccionadas
          for (let i = binAux.length; i > 0; i--) {
            if (binAux[i - 1] === "1") {
              document.getElementById(
                `radio-v${index + 1}-${binAux.length - i + 1}`
              ).checked = true;
            } else if (binAux[i - 1] === "0") {
              restaAux = restaAux + Math.pow(2, i);
              document.getElementById(
                `radio-v${index + 1}-${binAux.length - i + 1}`
              ).checked = false;
            }
          }
        } else {
          $("#modulo-1 .badge").html("Inactivo");
        }
      }
    }
  });
  $("#activar_todo").click(function (event) {
    event.preventDefault();
    if (modo_automatico === 0) {
      var valvulasact = '{"estados_valvulas":[0,0,0,0]}';
      mqttcommand = valvulasact;
      mqttsend = 1;
      document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

      document.querySelector(`#icon-comm`).classList.add("sincro");
      // $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');

      // $("#respuesta").html('Activando todas las valvulas...');
    }
  });

  $("#si").click(function (event) {
    event.preventDefault();
    // apagar_valvs();
    if (modo_automatico === 0) {
      var valvulasact = '{"estados_valvulas":[1,1,1,1]}';
      mqttcommand = valvulasact;
      mqttsend = 1;

      document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

      document.querySelector(`#icon-comm`).classList.add("sincro");
      // $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');

      // $("#respuesta").html('Apagando todas las Válvulas...');
    }
  });
  // $('#si-1').click(function (event) {
  //     event.preventDefault();

  //     $('#respuesta').fadeIn(1000); $('#resp-down').removeClass('d-none');

  //     $("#respuesta").html('Apagando todas las Válvulas...');

  // });
  //cambiar modo de activo/inactivo modo manual
  $("#reload").on("click", ".manual-toggle", function () {
    var id = $(this).attr("id");
    var alt = $(this).children("img").attr("alt");
    var valvulasact = '{"estado_valvula":[';

    if (modo_automatico === 0) {
      //console.log(websocketclient.connected);
      if (websocketclient.connected == true) {
        if (trueconnected++ == 10) {
          trueconnected = 10;
        }
      }
      var timeout = 0;
      if (websocketclient.connected == false) {
        //websocketclient.disconnect();
        websocketclient.connect();
        while (websocketclient.connected == false) {
          if (timeout++ == 999999999) {
            //console.log('timeout!!');
            timeout = 0;
            break;
          }
        }
      }
      //console.log(websocketclient.connected);
      if (websocketclient.connected == true) {
        if (trueconnected++ == 10) {
          trueconnected = 10;
        }
      }
      mqttcommand = "";
      //websocketclient.publish($('#publishTopic').val(),$('#publishPayload').val(),parseInt($('#publishQoSInput').val(),10),$('#publishRetain').is(':checked'))
      mqttsend = 1;
      mqttcommand = valvulasact + id.slice(-1) + "," + alt + "]}";
      document.querySelector(`#icon-comm`).classList.remove("connectsuccess"); //jscript nativo

      document.querySelector(`#icon-comm`).classList.add("sincro");
    }
  });
});
