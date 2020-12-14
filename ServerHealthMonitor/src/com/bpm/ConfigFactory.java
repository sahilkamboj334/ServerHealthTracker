package com.bpm;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;

import com.bpm.beans.Configs;
import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

public class ConfigFactory {

	private static ConfigFactory configFactory;
	private static Configs configs;
	
	public static void launchFactory() {
		if(configFactory==null) {
			configFactory=new ConfigFactory();
			load();
		}
	}
	
	private static void load() {
		try {
			configs=new Gson().fromJson(new FileReader(new File(System.getProperty("user.dir")+"/conf/config.json")), Configs.class);
		} catch (JsonSyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonIOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public static Configs config() {
		return configs;
	}
	public static ConfigFactory instance() {
		return configFactory;
	}

}
