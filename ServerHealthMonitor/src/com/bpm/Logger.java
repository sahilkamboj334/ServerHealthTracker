package com.bpm;

import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.SimpleFormatter;

public abstract class Logger {

	public static java.util.logging.Logger  logger= java.util.logging.Logger.getLogger("SystemHealthMonitor");
	 
	static
	    {
	    	FileHandler handler = null;
			try {
				handler = new FileHandler("./system-monitor.log", true);
				 SimpleFormatter formatter = new SimpleFormatter();  
				 handler.setFormatter(formatter); 
			} catch (SecurityException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
	    	logger.addHandler(handler);
	    }
	
	public static void info(String msg) {
		logger.log(Level.INFO, msg);
	}
}

