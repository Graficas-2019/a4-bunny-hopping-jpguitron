var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
cube = null,
waves = null,
directionalLight = null;

var duration = 10, // sec
crateAnimator = null,
waveAnimator = null,
lightAnimator = null,
waterAnimator = null,
animateCrate = true,
animateWaves = true,
animateLight = true,
animateWater = true,
loopAnimation = true;

var waterMapUrl = "../images/water_texture.jpg";
var createMapUrl = "../images/wooden_crate_1.jpg";
var objLoader = null;

function run()
{
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load(
        './Stanford_Bunny_OBJ-JPG/20180310_KickAir8P_UVUnwrapped_Stanford_Bunny.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('./Stanford_Bunny_OBJ-JPG/bunnystanford_res1_UVmapping3072_g005c.jpg');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            } );
                    
            bunny = object;
            bunny.scale.set(3,3,3);
            bunny.position.z = 0;
            bunny.position.x = 0;
            bunny.rotation.x = 0;
            bunny.rotation.y = Math.PI / 180 * 90;
            group.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function createScene(canvas) 
{
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 2, 8);
    scene.add(camera);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(0, 1, 2);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var waterMap = new THREE.TextureLoader().load(waterMapUrl);
    waterMap.wrapS = waterMap.wrapT = THREE.RepeatWrapping;
    waterMap.repeat.set(4, 4);

    var color = 0xffffff;
    var ambient = 0x888888;
    
    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    waves = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:waterMap, side:THREE.DoubleSide}));
    waves.rotation.x = -Math.PI / 2;
    waves.position.y = -1.02;
    
    // Add the waves to our group
    root.add( waves );

    // Create the cube geometry
    map = new THREE.TextureLoader().load(createMapUrl);
    geometry = new THREE.CubeGeometry(2, 2, 2);
    
    // And put the geometry and material together into a mesh
    var color = 0xffffff;
    ambient = 0x888888;
    
    loadObj();
    
    // Now add the group to our scene
    scene.add( root );
}

function getKeys(saltos)
{
    keys = [];
    keysR = [];

    saltosDura = 1/saltos;
    etapasSalto = saltosDura/6;
    actual = 0;

    for (var x = 0; x < saltos; x++)
    {
        for (var y = 0; y < 6; y++)
        {
            keys.push(actual);
            actual += etapasSalto;
        }
        keysR.push(actual);
    }

    return [keys,keysR];
}

angles = []

function divideLine(lines,jumps,x1,z1,x2,z2)
{

    divs = jumps.length;
     

    x = (-x1+x2)/divs;
    z = (-z1+z2)/divs;

    angles.push({y : Math.atan2(x2-x1,z2-z1)});

    jumps = [0,.6,1,1,.6,0]

    for (var cont = 0; cont <= divs;cont++)
    {
        xR = (cont * x) + x1; 
        yR = jumps[cont]
        zR = (cont * z) + z1;

        lines.push({ x : xR, y: yR, z: zR });
    }

    return lines;

}

keys = getKeys(16);
getK = keys[0];
getKR = keys[1];

jumps = [0,.6,1,.6,0];
lines = [];
lines = divideLine(lines,jumps,0,0,1,1.5);
lines = divideLine(lines,jumps,1,1.5,1.35,3.15);
lines = divideLine(lines,jumps,1.35,3.15,1,4.5);
lines = divideLine(lines,jumps,1,4.5,0,4.8);

lines = divideLine(lines,jumps,0,4.8,-1,4.5);
lines = divideLine(lines,jumps,-1,4.5,-1.35,3.15);
lines = divideLine(lines,jumps,-1.35,3.15,-1,1.5);
lines = divideLine(lines,jumps,-1,1.5,0,0);

lines = divideLine(lines,jumps,0,0,1,-1.5);
lines = divideLine(lines,jumps,1,-1.5,1.35,-3.15);
lines = divideLine(lines,jumps,1.35,-3.15,1,-4.5);
lines = divideLine(lines,jumps,1,-4.5,0,-4.8);

lines = divideLine(lines,jumps,0,-4.8,-1,-4.5);
lines = divideLine(lines,jumps,-1,-4.5,-1.35,-3.15);
lines = divideLine(lines,jumps,-1.35,-3.15,-1,-1.5);
lines = divideLine(lines,jumps,-1,-1.5,0,0);

console.log(lines);

function playAnimations()
{
    // position animation
    if (crateAnimator)
        crateAnimator.stop();
    
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);

    


    if (animateCrate)
    {
        crateAnimator = new KF.KeyFrameAnimator;
        crateAnimator.init({ 
            interps:
                [
                    { 
                        
                        keys: getK,
                        values:lines,
                        target:group.position
                    }
                    ,
                    { 
                        keys:getKR, 
                        values:angles,
                        target:group.rotation
                    },
                ],
            loop: loopAnimation,
            duration:duration * 1000,
            //easing:TWEEN.Easing.Bounce.InOut,
        });
        crateAnimator.start();
        
    }

}