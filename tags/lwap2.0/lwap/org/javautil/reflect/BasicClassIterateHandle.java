/*
 * BasicClassIterateHandle.java
 *
 * Created on 2002��1��8��, ����1:25
 */

package org.javautil.reflect;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;



/**
 *
 * @author  Administrator
 * @version 
 */

/** this is a basic handle that do nothing, extends this class and overload onXXX methods */

public class BasicClassIterateHandle implements ClassIterateHandle {

    public void onMethod(Class owner, Method m) {
    }    

    public void endIterate(Class cls) {
    }
    
    public void onConstructor(Class owner, Constructor constructor) {
    }
    
    public void beginIterate(Class cls) {
    }
    
    public void onInterface(Class owner, Class itf) {
    }
    
    public void onField(Class owner, Field fld) {
    }
   
}
