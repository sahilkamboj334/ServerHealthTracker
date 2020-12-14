package com.bpm.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Locale;

import org.hyperic.sigar.FileSystemUsage;
import org.hyperic.sigar.Sigar;
import org.hyperic.sigar.SigarException;

public abstract class SysUtil {
	static Sigar sigar=new Sigar();
	
	public static  HashMap<String, Object> getCPUInfo(){
		HashMap<String, Object> map=new HashMap<>();
		try {
			map.put("host_name", getHostName());
			map.put("ram_usage_percent",format(sigar.getMem().getUsedPercent()));
			map.put("free_ram_percent", format(sigar.getMem().getFreePercent()));
			map.put("ram_size", sigar.getMem().getRam()+" MB");
			map.put("cpu_load_percent", format(sigar.getCpuPerc().getCombined()*100));
			map.put("storage_used_percent", getFileSystemUsage("C:"));
			map.put("drive", "C:");
			map.put("used_storage",((sigar.getFileSystemUsage("C:").getUsed()/1024)/1024)+"GB");
			map.put("available_storage",((sigar.getFileSystemUsage("C:").getAvail()/1024)/1024)+"GB");
			map.put("timestamp",new Timestamp(System.currentTimeMillis()).getTime());
		} catch (SigarException e) {
			e.printStackTrace();
		}
		return map;
	}
	public static  HashMap<String, Object> getCPUInfo(String drive){
		HashMap<String, Object> map=new HashMap<>();
		try {
			map.put("host_name", getHostName());
			map.put("ram_usage_percent",format(sigar.getMem().getUsedPercent()));
			map.put("free_ram_percent", format(sigar.getMem().getFreePercent()));
			map.put("ram_size", sigar.getMem().getRam()+" MB");
			map.put("cpu_load_percent", format(sigar.getCpuPerc().getCombined()*100));
			map.put("drive", drive);
			map.put("storage_used_percent", getFileSystemUsage(drive));
			map.put("used_storage",((sigar.getFileSystemUsage(drive).getUsed()/1024)/1024)+"GB");
			map.put("available_storage",((sigar.getFileSystemUsage(drive).getAvail()/1024)/1024)+"GB");
			map.put("timestamp",new Timestamp(System.currentTimeMillis()).getTime());
		} catch (SigarException e) {
			e.printStackTrace();
		}
		return map;
	}
	public static double toDouble(String str){
		return Double.valueOf(str);
	}
	public static double getFileSystemUsage(String drive){
		double str=0;
		try {
			FileSystemUsage fileSystemUsage=sigar.getFileSystemUsage(drive);
			str=format(fileSystemUsage.getUsePercent()*100);
		} catch (SigarException e) {
			// TODO Auto-generated catch blockm
			e.printStackTrace();
		}
		return str;
	}
	static double format(double val) {
		return Double.valueOf(new DecimalFormat("##.##").format(val));
	}
	
	public static String getHostName(){
		try {
			return sigar.getNetInfo().getHostName();
		} catch (SigarException e) {
			e.printStackTrace();
		}
		return null;
	}
	private static String doubleToString(double value){
		return new DecimalFormat("##.##").format(value);
	}
	public static String executeCommand(String command){
		StringBuilder builder=new StringBuilder();
		BufferedReader bufferedInputStream=null;
		Process process=null;
		try {
			process=Runtime.getRuntime().exec(command);
			bufferedInputStream=new BufferedReader(new InputStreamReader(process.getInputStream()));
			String str=null;
			while((str=bufferedInputStream.readLine())!=null){
				builder.append(str);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally{
		try {
			bufferedInputStream.close();
			process.destroy();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		return builder.toString();	
		
	}
	public static void main(String[] args) {
		try {
			//
			//System.out.println(getCPUInfo());
			System.out.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss",Locale.ENGLISH).parse("10-12-2020 6:48:46").getTime());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
