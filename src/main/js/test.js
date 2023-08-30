const { remote } = require('electron');
const $ = require('jquery');
const electron = require("electron");
const fs = require('fs');
const path = require('path');
const bootstrap = require('bootstrap');

const settingsPath = path.join(__dirname, 'src', 'main', 'conf', 'settings.json');

import { busquedaUsuarios, cargarEmpresas, generarDatos_Usuario, generarPermisosLista,
   generarTablaUsr, generarTerminalesLista ,generarHorarioLista, listaTerminales} from './bbdd/bbdd_main.js';

import {
  actualizarHorario,
  cnxDB, guardarTerminal, insupdCalendario, queryEmpresas
} from './bbdd/sql server/mssql.js'
cargando()
//--------------------------------------------

const ipc = electron.ipcRenderer;

const crr = document.getElementById("crr");

crr.addEventListener("click", function() {
    ipc.send("cerrar-ventana");
});

const mn = document.getElementById("mn");

mn.addEventListener('click', function(){
  ipc.send('minimizar-ventana');
});

//--------------------------------------------

$(document).ready(function() {
  var conexion = cnxDB()
  if (conexion==false){
    alert("No se ha podido establecer conexión con la BBDD. El programa se cerrará.")
    ipc.send('cerrar-ventana')
  }
  queryEmpresas()
  listo() 
  inicio();
  setupNavigation();
  setupContent()

});

export function cargando() {
  if(window.modoOscuro){
    $('.content').css('background-color','#2c2c2c')

  }
  document.getElementById('loading-popup').classList.add('show');
  $('.content').animate({opacity:0.1},50)
}

export function listo() {


  setTimeout(function() {
    $('.content').animate({opacity:1},100)
    document.getElementById('loading-popup').classList.remove('show');
  },100);

  
}


function setupNavigation() {
  $('.nav-link').off('click').on('click', function(event) {
    cargando()
    $('.nav-link.active').removeClass('active');
    $(this).addClass('active');

    var selectedOption = $(this).text();


    // FUNCIONES PARA LA ELECCION DE LAS PESTAÑAS DE LA IZQUIERDA. ESTO CARGA LAS BARRAS DE NAVEGACION , LUEGO ELIGE LA PRIMERA PESTAÑA Y CARGA SU CONTENIDO POR DEFECTO


    if (selectedOption === 'Usuarios') {
      $('.content').load('src/main/html/usuarios.html', function() {

        dbit('CARGANDO USUARIOS')
        inicial = true
        setupContent();
        usuariosNavegacion();
        resizeContent('usuarios-content');
      });
    } else if (selectedOption === 'Calendario') {
      $('.content').load('src/main/html/calendario.html', function() {

        dbit('CARGANDO CALENDARIO')
        calendarioNavegacion()
        setupContent();

        resizeContent('calendario-content');
      });
    } else if (selectedOption === 'Horario') {
      $('.content').load('src/main/html/horario.html', function() {
        
        dbit('CARGANDO HORARIO')
        horarioNavegacion()
        datosHorarios()
        setupContent();
        resizeContent('horario-content');
      });
    } else if (selectedOption === 'Terminales') {
      $('.content').load('src/main/html/terminales.html', function() {

        dbit('CARGANDO TERMINALES')

        setupContent();
        terminalesNavegacion()
        resizeContent('terminales-content');
      });
    } else if (selectedOption === 'Ajustes') {
      $('.content').load('src/main/html/ajustes.html', function(){
        cargarConfiguracion();
      });
    } else {
      var content = 'Contenido para la opción "' + selectedOption + '"';
      $('.content').html(content);
    }

    listo()
  });
}









export function setupContent() {
  if (window.modoOscuro) {
    $('body').removeClass('light-mode');
  } else {
    $('body').addClass('light-mode');
  }
  $(document).off('click').on('click', '.nav-tab', function() {
    var tabId = $(this).data('tab');
    tabId = tabId.toLowerCase();
    activateTab(tabId);
    resizeContent(tabId + '-content'); // Cambio aquí
  });

  activateTab('datos');
}












function activateTab(tabId) {
  $('.tab-content').hide();
  $('#tab-' + tabId).show();
  $('.nav-tab').removeClass('active');
  $('.nav-tab[data-tab="' + tabId + '"]').addClass('active');
}













function cambiarArchivoCssModo() {
  const principalStylesheetLink = document.getElementById('principalsheet');
  if (window.modoOscuro) {
    principalStylesheetLink.href = 'src/main/css/styles.css';
    $('body').removeClass('light-mode');
    
  } else {
    principalStylesheetLink.href = 'src/main/css/styles-light.css';
    $('body').addClass('light-mode');
  }
}

function cargarConfiguracion() {
  const modoOscuroSlider = document.getElementById('modo-oscuro-slider');

  modoOscuroSlider.addEventListener('click', function() {
    cambiarModoOscuro();
  });

  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (err) {
      fs.writeFileSync(settingsPath, JSON.stringify({ modoOscuro: true }));
    } else {
      const configuracion = JSON.parse(data);
      window.modoOscuro = configuracion.modoOscuro;
      modoOscuroSlider.classList.toggle('active', window.modoOscuro);
      cambiarArchivoCssModo();
    }
  });
}

function cambiarModoOscuro() {
  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (!err) {
      const configuracion = JSON.parse(data);
      window.modoOscuro = !configuracion.modoOscuro;
      configuracion.modoOscuro = window.modoOscuro;
      console.log(configuracion);
      document.getElementById('modo-oscuro-slider').classList.toggle('active', window.modoOscuro);
      fs.writeFile(settingsPath, JSON.stringify(configuracion), (err) => {
        if (!err) {
          cambiarArchivoCssModo();
          
        }
      });
    }
  });
}

function inicio(){
  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (err) {
      fs.writeFileSync(settingsPath, JSON.stringify({ modoOscuro: true }));
    } else {
      const configuracion = JSON.parse(data);
      window.modoOscuro = configuracion.modoOscuro;
      cambiarArchivoCssModo();
    }
  });
}

export function resizeContent(contentId) {
  const contentDiv = document.getElementById(contentId);
  const parentDiv = document.getElementById('contenido');

  if (!contentDiv || !parentDiv) {
    return;
  }

  // Ocultar el contenido antes de redimensionar
  $(contentDiv).hide();

  const computedStyles = getComputedStyle(parentDiv);
  const availableWidth = parentDiv.clientWidth;
  const availableHeight = parentDiv.clientHeight;

  contentDiv.style.width = availableWidth + 'px';
  contentDiv.style.height = availableHeight + 'px';

  // Mostrar el contenido nuevamente después de redimensionar
  $(contentDiv).show();


}

export function terminalesNavegacion(){ //TERMINALES
  cargando()
  $('.terminales-container').width(1001);
  var tb = $('#tab-eleccion')
  tb.load('src/main/html/terminales/datos_terminales.html',function(){
    rellenarTerminales(1)
    $('#t').empty().append('<option value="on">On</option><option value="off">Off</option>')
    $('#s').empty().append('<option value="1">1</option><option value="2">2</option>')
    $('#u').empty().append('<option value="TCPIP"> TCP/IP </option>')
    $('#x').empty().append('<option value="TARJETA">TARJETA</option>')
    botonesTerminales()
    $('#e').off().on('keyup',function(e,f){

      cargando()
      rellenarTerminales($('#e').text())
      listo()

    })
  })
  




  $('#ter_dt').off('click').on('click', function(){
    cargando()
    tb.empty()
    tb.load('src/main/html/terminales/datos_terminales.html',function(){
      setTimeout(function() {
      listo();  
      $('#t').empty().append('<option value="on">On</option><option value="off">Off</option>')
      $('#s').empty().append('<option value="1">1</option><option value="2">2</option>')
      $('#u').empty().append('<option value="TCPIP"> TCP/IP </option>')
      $('#x').empty().append('<option value="TARJETA">TARJETA</option>')
      botonesTerminales()
      rellenarTerminales(1)
      $('#e').off().on('keyup',function(e,f){
        cargando()
        rellenarTerminales($('#e').text())
        listo()
      })
    }, 0) 
    })
  })
    $('#ter_lt').off('click').on('click',function(){
      cargando()
      tb.empty()
      
      tb.load('src/main/html/terminales/lista.html', function(){
          setTimeout(function() {
            generarTerminalesLista('')
            listo()
      }, 100);})
    })
    listo()
    

}
var inicial = true
export function usuariosNavegacion(){ //USUARIOS
  cargando()
  $('.usuarios-container').width($('#contenido').width());
  $('#tab-eleccion').width($('#contenido').width());
  $('#contus').width($('#contenido').width());
  $('#dtsfrm').width($('#contenido').width());

  $('#tab-eleccion').height($('#contenido').height());
  $('#contus').height($('#contenido').height());
  $('#dtsfrm').width($('#contenido').width());
 
  var tb = $('#tab-eleccion')



  tb.load('src/main/html/usuarios/datos.html',function(){
    if (inicial == true){
      generarDatos_Usuario(busquedaUsuarios())
      inicial = false
    }
  })

  var lst = busquedaUsuarios()
  cargarEmpresas()

  listo()
  $('#usr-dt').off('click').on('click', function(){

    dbit('Cargando DATOS de USUARIOS')
    inicial = true
    cargando()
    tb.empty()
    tb.load('src/main/html/usuarios/datos.html',function(){
          
      generarDatos_Usuario(busquedaUsuarios())
      setTimeout(function() {
      listo();  }, 100) 
      $('#e').off.on('keyup',function(e){

        rellenarTerminales(e)

      })
    })
  })
  $('#usr-lt').off('click').on('click',function(){
    cargando()

    dbit('Cargando Listado en USUARIOS')

    tb.empty()

    tb.load('src/main/html/usuarios/lista.html', function(){
        
      setTimeout(function() {
        dbit(generarTablaUsr())
        listo();
          
    }, 100);
      
    })
  })
  $('#usr-pr').off('click').on('click',function(){

    dbit('Cargando PERMISOS en USUARIOS') 

    cargando()
    tb.empty()
    tb.load('src/main/html/usuarios/permisos.html', function(){

      generarPermisosLista()

         setTimeout(function() {
       listo();  
     }, 100); })
      
  })

}

async function horarioNavegacion(){ //HORARIOS
  cargando()
  dbit('CARGANDO CALENDARIO')
  $('.horario-container').width($('#contenido').width());
  var tb = $('#tab-eleccion')
  tb.load('src/main/html/horario/datos_horarios.html')
  listo()
  $('#hr_dt').off('click').on('click', function(){
    cargando()
    tb.empty()
    tb.load('src/main/html/horario/datos_horarios.html',function(){
      setTimeout(async function() {
      listo();
      datosHorarios()
    }, 100) 
    })
  })
    $('#hr_lt').off('click').on('click',function(){
      cargando()
      tb.empty()
      tb.load('src/main/html/horario/lista.html', function(){
          setTimeout(function() {
          generarHorarioLista('')
          listo();  
      }, 100);})
    })
}

 function calendarioNavegacion(){ //CALENDARIO
  cargando()
  dbit('CARGANDO CALENDARIO')
  $('.calendario-container').width($('#contenido').width());
  var tb = $('#tab-eleccion')
  tb.load('src/main/html/calendario/datos_calendario.html',function(){
    $('#save').on('click', async function() {
      let calendarioData = {
        idCalendario: parseInt($('#cal-id').val()),
        Descripcion: $('#desc').val(),
        idHorarioL: $('.day select').val(),
        idHorarioM: $('.day select').val(),
        idHorarioX: $('.day select').val(),
        idHorarioJ: $('.day select').val(),
        idHorarioV: $('.day select').val(),
        idHorarioS: $('.day select').val(),
        idHorarioD: $('.day select').val(),
      }
    
      insupdCalendario(calendarioData)
    })
    $('#cal-id').on('keyup', async function() {
      console.log("hikla")
      let id = $('#cal-id').val() - 1;
      rellenarCalendario(id);
      })
    
  })
  listo()
 
  $('#cl_dt').off('click').on('click', function(){
    cargando()
    tb.empty()
    tb.load('src/main/html/calendario/datos_calendario.html',function(){


      $('#save').on('click', async function() {
        let calendarioData = {
          idCalendario: parseInt($('#cal-id').val()),
          Descripcion: $('#desc').val(),
          idHorarioL: $('.day select').eq(0).val(),
          idHorarioM: $('.day select').eq(1).val(),
          idHorarioX: $('.day select').eq(2).val(),
          idHorarioJ: $('.day select').eq(3).val(),
          idHorarioV: $('.day select').eq(4).val(),
          idHorarioS: $('.day select').eq(5).val(),
          idHorarioD: $('.day select').eq(6).val(),
        }
      
        insupdCalendario(calendarioData)
      })

      $('#cal-id').on('keyup', function() {
        var resultadoQuery = queryCalendarios()
        let id = $('#cal-id').val() - 1;

          rellenarCalendario(id);
      })
      
      setTimeout(function() {
      listo();  }, 100) 
    })
  })
    $('#cl_lt').off('click').on('click',function(){
      cargando()
      tb.empty()
      tb.load('src/main/html/calendario/lista.html', function(){
          
        tablaCal()
        
        setTimeout(function() {
          
          listo();
          
          


      }, 100);})
    })
}

async function guardarCalendario(){

}

async function botonesTerminales(){

  $('#i').children().each(function(){
    console.log('fgsdnkg')
    $(this).css('cursor','pointer')
    $(this).on('click',function(){
      if ($(this).hasClass('SELECCIONADO')){
        $(this).removeClass('SELECCIONADO')
      } else {
        $(this).addClass('SELECCIONADO')
      }
    })
  })

  $('#f').on('click',function(){
    guardarDatos()
    $(this).animate({width: '60px', height: '20px'}, 100)
    .animate({width: '71px', height: '26px'}, 100);
  })
}

function busquedaTerminales(){

}

var listaTER
async function rellenarTerminales(a){
  console.log(typeof(a))
  a=parseInt($('#e').val())-1

 listaTER = await listaTerminales().then()

var lista = listaTER
  try {
    a = Number(a)

  const t = listaTER[a]
    console.log(t)

  if (t.Presencia) {
    $('#j1').addClass('SELECCIONADO');
  }
  if (t.Acceso) {
    $('#k1').addClass('SELECCIONADO');
  }
  if (t.AntiPB) {
    $('#l1').addClass('SELECCIONADO');
  }
  if (t.FichajeMasivo) {
    $('#m1').addClass('SELECCIONADO');
  }
  if (t.RegErrores) {
    $('#n1').addClass('SELECCIONADO');
  }
  if (t.LectorAux) {
    $('#o1').addClass('SELECCIONADO');
  }
  if (t.HorariosAux) {
    $('#p1').addClass('SELECCIONADO');
  }
  if (t.AbreSiempreAux) {
    $('#q1').addClass('SELECCIONADO');
  }
  $('#w').val(t.IP)
  
  // Para casillas de verificación
  $('#an').prop('checked', t.DesAutoAl);
  $('#ao').prop('checked', t.ControlAforo);
  $('#aw').prop('checked', t.Auxiliar);
  $('#ax').prop('checked', t.Motorizado);
  $('#ay').prop('checked', t.ControlAforo);

  // Para elementos input de tipo texto y número
  $('#ac').val(t.Cort_in);
  $('#ad').val(t.Cort_out);
  $('#ah').val(t.Tmp_msg);
  $('#ai').val(t.Tmp_user);
  $('#aj').val(t.TCerradura);
  $('#aq').val(t.Tmp_ActAl);
  $('#ar').val(t.PIN_Alarma);
  $('#as').val(t.PIN_Alarma);
  $('#bb').val(t.idTerminal);
  $('#bc').val(t.ReleCerradura);
  $('#bd').val(t.ReleCerradura);
  $('#be').val(t.TCerradura);
  $('#bf').val(t.ReleZumbador);
  $('#bg').val(t.TZumbador);

} catch(e){
  console.log("No hay resultados   " + e )
   // Eliminar la clase 'SELECCIONADO' de elementos <p>
   $('#j1, #k1, #l1, #m1, #n1, #o1, #p1, #q1').removeClass('SELECCIONADO');

   // Desmarcar casillas de verificación
   $('#an, #ao, #aw, #ax, #ay').prop('checked', false);
 
   // Vaciar campos de texto y número
   $(' #w, #ac, #ad, #ah, #ai, #aj, #aq, #ar, #as, #bb, #bc, #bd, #be, #bf, #bg').val('');
 
}

}


function guardarDatos(){

  const formData = {
    idTerminal: $('#e').val(),
    Presencia: $('#j1').hasClass('SELECCIONADO') ? 1 : 0,
    Acceso: $('#k1').hasClass('SELECCIONADO') ? 1 : 0,
    AntiPB: $('#l1').hasClass('SELECCIONADO') ? 1 : 0,
    FichajeMasivo: $('#m1').hasClass('SELECCIONADO') ? 1 : 0,
    RegErrores: $('#n1').hasClass('SELECCIONADO') ? 1 : 0,
    LectorAux: $('#o1').hasClass('SELECCIONADO') ? 1 : 0,
    HorariosAux: $('#p1').hasClass('SELECCIONADO') ? 1 : 0,
    AbreSiempreAux: $('#q1').hasClass('SELECCIONADO') ? 1 : 0,
    IP: $('#w').val(),
    DesAutoAl: $('#an').prop('checked') ? 1 : 0,
    ControlAforo: $('#ao').prop('checked') ? 1 : 0,
    Auxiliar: $('#aw').prop('checked') ? 1 : 0,
    Motorizado: $('#ax').prop('checked') ? 1 : 0,
    Cort_in: $('#ac').val(),
    Cort_out: $('#ad').val(),
    Tmp_msg: $('#ah').val(),
    Tmp_user: $('#ai').val(),
    TCerradura: $('#aj').val(),
    Tmp_ActAl: $('#aq').val(),
    PIN_Alarma: $('#ar').val(),
    ReleCerradura: $('#bc').val(),
    ReleZumbador: $('#bf').val(),
    TZumbador: $('#bg').val()
  };

  guardarTerminal(formData)


}

import { queryHorarios, queryCalendarios } from './bbdd/sql server/mssql.js';
async function datosHorarios(){

  let resultado = await queryHorarios();
  $('#cal-id').on('keyup', function() {
    console.log("hola")
    let id = parseInt($(this).val()) - 1;


    let obj = resultado[id];

    // Si el objeto existe, llena los campos con la información del objeto
    if(obj) {
      $('#desc').val(obj.Descripcion);
      $('#i1s').val(obj['Hora Inicio 1']);
      $('#i1e').val(obj['Hora Fin 1']);
      $('#i2s').val(obj['Hora Inicio 2']);
      $('#i2e').val(obj['Hora Fin 2']);
      $('#i3s').val(obj['Hora Inicio 3']);
      $('#i3e').val(obj['Hora Fin 3']);
    }
    // Si no existe, vacía todos los campos
    else {
      $('#desc').val("");
      $('#i1s').val("");
      $('#i1e').val("");
      $('#i2s').val("");
      $('#i2e').val("");
      $('#i3s').val("");
      $('#i3e').val("");
    }}

    

  )


   $('#save').on('click',function() {
    let horarioData = {
      id: parseInt($('#cal-id').val()),
      desc: $('#desc').val(),
      i1s: $('#i1s').val(),
      i1e: $('#i1e').val(),
      i2s: $('#i2s').val(),
      i2e: $('#i2e').val(),
      i3s: $('#i3s').val(),
      i3e: $('#i3e').val()
    };

      actualizarHorario(horarioData)
    
    })
  
  }


async function tablaCal(){
    let resultadoQuery = await queryCalendarios();

  if (resultadoQuery.length > 0) {
    // Crear el encabezado con las claves
    const keys = Object.keys(resultadoQuery[0]);
    let header = '<tr>';
    keys.forEach(key => {
      header += `<th>${key}</th>`;
    });
    header += '</tr>';

    // Crear las filas con los valores
    let rows = '';
    resultadoQuery.forEach(row => {
      rows += '<tr class="filaDatos">';
      keys.forEach(key => {
        rows += `<td>${row[key]}</td>`;
      });
      rows += '</tr>';
    });

    // Componer la tabla completa
    const table = `<table class="table table-hover" id="table">
                    <thead>${header}</thead>
                    <tbody>${rows}</tbody>
                   </table>`;
  
    $('.table-container').html(table);
    $('#table').parent().parent().prepend('<input type="text" id="searchInput" placeholder="Buscar..." class="form-control mb-3">');

    // Evento de click para cada fila
    $('.table tr').on('click', function() {
      if ($(this).hasClass('SELECCIONADO')) {
        $(this).removeClass('SELECCIONADO');
      } else {
        $(this).addClass('SELECCIONADO');
      }
    });
  }
  }



async function rellenarCalendario(id){
  var resultadoQuery = await queryCalendarios();
  var horarioOptions = await queryHorarios(); // Asume que esto devuelve todas las opciones de horarios en un array
  let calendarioData = resultadoQuery[id];
  
  $('#cal-id').val(calendarioData.idCalendario);
  $('#desc').val(calendarioData.Descripcion);

  // Rellenar todos los selects con las opciones disponibles
  $('.day select').each(function() {
    let optionsHtml = "";
    horarioOptions.forEach(function(horario) {
      optionsHtml += `<option value="${horario.idHorario}">${horario.Descripcion}</option>`;
    });
    $(this).html(optionsHtml);
  });

  // Seleccionar la opción correcta en cada select
  $('.day select').each(function(index) {
    let dayMapping = ['idHorarioL', 'idHorarioM', 'idHorarioX', 'idHorarioJ', 'idHorarioV', 'idHorarioS', 'idHorarioD'];
    $(this).val(calendarioData[dayMapping[index]]);
  });



}
  // FUNCION DE DEBUG


export function dbit(s){
  s = new Date().getHours() + ':' + new Date().getMinutes() + "   MENSAJE DEBUG: " + s 
  console.log(s)
}