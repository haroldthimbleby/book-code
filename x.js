var a;

a = [3,"3"];
z="";
y=1;
for( var b = 0; b<a.length;b++ )
{
x = a[b];

if( x < 5 ) 
{
console.log("x + 1 = "+(   x+1   ));
console.log("Associativity test: " +(    (x+y)+z==x+(y+z)   ));
}



console.log("---");
if( x < 4 )
{	y = x + 1;
	if( y > 4 ) console.log("ERROR");
	
		console.log("x="+x+"  y="+y);

}


}