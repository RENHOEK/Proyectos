window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           window.setTimeout(callback, 1000/60);
         };
})();

//DEfine un alert con con Jquery
window.alert = function(message) {
                	$('#dialogmessage').text(message).dialog({
                		modal:true,
                		title:'Error',
                		buttons: {
                			Aceptar:function(){
                				$(this).dialog('close');
                			}
                		}
                	});
                };
/*
    Funcion que obtiene el contexto WebGL
*/
function contextoWebGL(canvas)
{
    var cWebgl;
    try
    {
    	cWebgl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    	cWebgl.viewportWidth = canvas.width;
    	cWebgl.viewportHeight = canvas.height;
    	console.log("Se consigio el contexto WebGL");
        return cWebgl;
    }
    catch (e)
    {
    	console.log("No puede iniciarse WebGL en este navegador");
    	return null;
    }
}


/*
    Objeto que contiene como atributos las matrices y el programaShader
*/
var atributosPipeline = function(mv, p)
{
   this.mvMatriz = mv;//Contiene la matriz Modelo-Vista
   this.pMatriz = p;//Contiene la matriz de Proyeccion
   this.ShaderProgram = null;//Contiene el Programa Shader
   this.mvPilaMatriz = [];
   this.toString = function()//Imprime un log de los atributos del objeto
   {
       console.log("\nAtributos Pipeline");
       console.log("\tShaderProgram: "+this.ShaderProgram);
       console.log("Pila de Matrices contiene: %d",this.mvPilaMatriz.lenght);
       console.log("\tMatriz Modelo-Vista...");
       for(var i=0; i<this.mvMatriz.length; i=i+4)
       {
    	   var j;
    	   if(i%4==0)
    		j = i/4;
	       console.log("\t\tFila [%2d] = [%2f, %2f, %2f, %2f]",j,this.mvMatriz[i],this.mvMatriz[i+1],this.mvMatriz[i+2],this.mvMatriz[i+3]);
       }
       console.log("\tMatriz Proyeccion...");
       for(var i=0; i<this.pMatriz.length; i=i+4)
       {
    	   var j;
    	   if(i%4==0)
    		j = i/4;
    	   console.log("\t\tFila [%2d] = [%2f, %2f, %2f, %2f]",j,this.pMatriz[i+1],this.pMatriz[i+1],this.pMatriz[i+2],this.pMatriz[i+3]);
       }
   }
}


/*
    Objeto que contendra los vertices, buffers, tamaño Matriz
    Numero de elementos de la matriz
*/
var objeto3D = function(vertices)
{
    this.vertices = vertices;
    this.noElementos = this.vertices.length/3;
    this.vectoresColor = [];
    this.indicesVertices=null;

    this.bufferVertices = null;
    this.bufferColor=null;
    this.bufferIndicesVertices=null;
    this.toString = function()
    {
        console.log("\nObjeto 3D");
    	console.log("\tNo. Elementos Objeto: "+ this.noElementos);
        console.log("\tNo. Elementos Color: "+ this.vectoresColor.length/4);
        console.log("\tNo. Elementos Indice Vertices: "+ this.indicesVertices);
        console.log("\tBuffer de los Vertices: "+this.bufferVertices);
	    console.log("\tBuffer del Color: "+ this.bufferColor);
        console.log("\tBuffer Indice Vertices: "+ this.indicesVertices);
        console.log("\tVertices del Objeto 3D[%d]... ",this.noElementos);
        for(var i=0; i<this.vertices.length; i=i+3)
    	{

    	    var j;
    	    if(i%3==0)
    		    j = i/3;
	        console.log("\t\tVertice [%2f] = [%2f, %2f, %2f]",j,this.vertices[i],this.vertices[i+1],this.vertices[i+2]);
    	}
        if(this.vectoresColor)
        {
          console.log("\tVertices del Color[%d]... ",this.vectoresColor.length/4);
          for(var i=0; i<this.vectoresColor.length; i=i+4)
    	  {
    	    var j;
    	    if(i%4==0)
    		    j = i/4;
	        console.log("\t\tColor Vertice [%2f] = [%2f, %2f, %2f, %2f]",j,this.vectoresColor[i],this.vectoresColor[i+1],this.vectoresColor[i+2],this.vectoresColor[i+3]);
    	  }
        }
        if(this.indicesVertices)
        {
          console.log("\tVertices de los Indices[%d]... ",this.indicesVertices.length/3);
          for(var i=0; i<this.indicesVertices.length; i=i+3)
    	  {
    	    var j;
    	    if(i%3==0)
    		    j = i/3;
	        console.log("\t\tColor Vertice [%2f] = [%2f, %2f, %2f, %2f]",j,this.indicesVertices[i],this.indicesVertices[i+1],this.indicesVertices[i+2]);
    	  }
        }
    }
}


/*
    Funcion que copia las matrices modelo-vista y proyeccion del objeto pipeline
    en la Tarjeta grafica.
*/
function setMatrizUniforms(webgl, at)
{
	webgl.uniformMatrix4fv(at.ShaderProgram.pMatrizUniform, false, at.pMatriz);
	webgl.uniformMatrix4fv(at.ShaderProgram.mvMatrizUniform, false, at.mvMatriz);
	//console.log("Se asignaron las matrices en la Tarjeta Grafica");
}


/*
    Funcion que lee el codigo de los scripts del vertex
    y fragment Shader
*/
function getShader(webgl, id)
{
    var shader;
	var codigoShader = document.getElementById(id);
    var codigo = "";
	var k = codigoShader.firstChild;
	if (!codigoShader)
	{
		return null;
	}
    else
    {
        while (k)//Leemos el codigo del vertex o shader
    	{
            if (k.nodeType == 3)
                codigo += k.textContent;
            k = k.nextSibling;
    	}

        if (codigoShader.type == "x-shader/x-fragment")
	    	shader = webgl.createShader(webgl.FRAGMENT_SHADER);
        if (codigoShader.type == "x-shader/x-vertex")
		    shader = webgl.createShader(webgl.VERTEX_SHADER);
        webgl.shaderSource(shader, codigo);
	    webgl.compileShader(shader);

        if (!webgl.getShaderParameter(shader, webgl.COMPILE_STATUS))
        {
    		alert(webgl.getShaderInfoLog(shader));
    		return null;
	    }
        else
        {
            console.log("Se obtuvo el Shader");
            return shader;
        }
    }
}
 function mvPushMatriz(at)
 {
        var copy = at.mvMatriz;
        at.mvPilaMatriz.push(copy);
 }

function mvPopMatriz(at)
{
        if (at.mvPilaMatriz.length == 0) {
            throw "No hay elementos que se puedan elimininar";
        }
        at.mvMatriz = at.mvPilaMatriz.pop();
}
function grado_radian(grados)
{
        return grados * Math.PI / 180;
}
function checarBox(id)
{
   if(document.getElementById(id).checked==true)
      return 1;
   else
     return 0;
}

function checarNumber(id)
{
  return parseFloat(document.getElementById(id).value);
}
//DEclara un cubo ya definido
var cuboP = function()
{
  this.vertices=[-1.0, -1.0,  1.0, // Cara frontal
                  1.0, -1.0,  1.0,
                  1.0,  1.0,  1.0,
                 -1.0,  1.0,  1.0,
                 -1.0, -1.0, -1.0,// Cara trasera
                 -1.0,  1.0, -1.0,
                  1.0,  1.0, -1.0,
                  1.0, -1.0, -1.0,
                 -1.0,  1.0, -1.0,// Cara de arriba
                 -1.0,  1.0,  1.0,
                  1.0,  1.0,  1.0,
                  1.0,  1.0, -1.0,
                 -1.0, -1.0, -1.0,// cara de abajo
                  1.0, -1.0, -1.0,
                  1.0, -1.0,  1.0,
                 -1.0, -1.0,  1.0,
                  1.0, -1.0, -1.0,// Cara derecha
                  1.0,  1.0, -1.0,
                  1.0,  1.0,  1.0,
                  1.0, -1.0,  1.0,
                 -1.0, -1.0, -1.0,// Cara izquierda
                 -1.0, -1.0,  1.0,
                 -1.0,  1.0,  1.0,
                 -1.0,  1.0, -1.0];


function coloresmatriz()
{
  var colores = [[1.0, 0.0, 0.0, 1.0], // Rojo- Cara frontal
                 [1.0, 1.0, 0.0, 1.0], // Amarillo - Cara trasera
                 [0.0, 1.0, 0.0, 1.0], // Verde - Cara arriba
                 [1.0, 0.5, 0.5, 1.0], // Naranja - Cara abajo
                 [1.0, 0.0, 1.0, 1.0], // Rosa - Cara derecha
                 [0.0, 0.0, 1.0, 1.0]];// Azul - Cara izquierda
  var matriz=[];
    for (var i in colores)
    {
        var colorpuntos = colores[i];
        for (var j=0; j < 4; j++)
        {
            matriz = matriz.concat(colorpuntos);
        }
    }
    return matriz;
}
 this.vectoresColor =  coloresmatriz();

 //2 Triangulos que componen a cda una de las caras del cubo
  this.indicesVertices = [0, 1, 2,      0, 2, 3,    //Componen cara Frontal
                          4, 5, 6,      4, 6, 7,    // Componen Cara trasera
                          8, 9, 10,     8, 10, 11,  //Componen cara arriba
                          12, 13, 14,   12, 14, 15, // Componen cara abajo
                          16, 17, 18,   16, 18, 19, // Componen cara derecha
                          20, 21, 22,   20, 22, 23];  // Componen Cara izquierda
  this.bufferVertices = null;
  this.bufferColor=null;
  this.bufferIndicesVertices=null;
  this.toString = function()
  {
    console.log("\tNumero Vertices [%d]",this.vertices.length);
    console.log("\tNumero Vertices Color [%d]",this.vectoresColor.length);
    console.log("\tNumero Indices de Vertices  [%d]",this.indicesVertices.length);
    console.log("\tBuffer Vertices: "+this.bufferVertices);
    console.log("\tBuffer Color: "+this.bufferColor);
    console.log("\tBuffer Indices de Vertices: "+this.bufferIndicesVertices);
  }

}