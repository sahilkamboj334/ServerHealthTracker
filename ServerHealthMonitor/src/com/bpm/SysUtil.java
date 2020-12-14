package com.bpm;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

import org.hyperic.sigar.FileSystemUsage;
import org.hyperic.sigar.Sigar;
import org.hyperic.sigar.SigarException;

public strictfp abstract class SysUtil {
	static Sigar sigar=new Sigar();
	static String cpuUsageCmd="powershell.exe   Get-Counter '\\Process(*)\\% Processor Time' | Select-Object -ExpandProperty countersamples| Select-Object -Property instancename, cookedvalue| ? {$_.instanceName -notmatch '^(idle)$'} | ? {$_.instanceName -notmatch '^(_total)$'} | Sort-Object -Property cookedvalue -Descending| Select-Object -First 25| ft InstanceName,@{L='CPU';E={($_.Cookedvalue/100/$env:NUMBER_OF_PROCESSORS).toString('P')}} -AutoSize";
	public static  Map<String, Object> getCPUInfo(){
		HashMap<String, Object> map=new HashMap<>();
		try {
			map.put("host_name", getHostName());
			map.put("ram_usage_percent",(sigar.getMem().getUsedPercent()));
			map.put("free_ram_percent", (sigar.getMem().getFreePercent()));
			map.put("ram_size", sigar.getMem().getRam()+" MB");
			map.put("cpu_load_percent", formatDouble(sigar.getCpuPerc().getCombined()*100));
		} catch (SigarException e) {
			e.printStackTrace();
		}
		return map;
	}
	
	public static synchronized double ramUsagePrecent() {
		try {
			return formatDouble(sigar.getMem().getUsedPercent());
		} catch (SigarException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}
	public static void sleep(int sec) {
		try {
			Thread.sleep(sec*1000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public static synchronized double cpuLoad() {
		try {
			return formatDouble(sigar.getCpuPerc().getCombined()*100);
		} catch (SigarException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}
	public static double toDouble(String str){
		return Double.valueOf(str);
	}
	public static synchronized double getUsedStorage(String drive)
	{
		try {
			return (sigar.getFileSystemUsage(drive).getUsed()/1024)/1024;
		} catch (SigarException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}
	public static double getFreeStorage(String drive)
	{
		try {
			return (sigar.getFileSystemUsage(drive).getAvail()/1024)/1024;
		} catch (SigarException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}
	public static synchronized double getFileSystemUsage(String drive){
		try {
			FileSystemUsage fileSystemUsage=sigar.getFileSystemUsage(drive);
			return formatDouble(fileSystemUsage.getUsePercent()*100);
		} catch (SigarException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}
	
	public static synchronized String getHostName(){
		try {
			return sigar.getNetInfo().getHostName();
		} catch (SigarException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static double formatDouble(double num) {
		return Double.valueOf(new DecimalFormat("##.##").format(num));
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
				builder.append(str+"\n");
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
	public static String currentTime(){
		return new SimpleDateFormat("dd-mm-yyyy_hh-mm-ss").format(new Date());
	}
	public static String ip() {
		try {
			return InetAddress.getLocalHost().getHostAddress();
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "0.0.0.0";
	}
	public static ArrayList<String> commaSeperatedStringToList(String list){
		ArrayList<String> rtlist=new ArrayList<>();
		for(String str:list.split(","))
			if(str.length()>0)
				rtlist.add(str);
		return rtlist;
	}
	public static void writeStringToFile(String data,String filePath,String name){
		FileWriter fileWriter=null;
		try {
			File a=new File(filePath);
			if(!a.exists()) a.mkdirs();
			fileWriter = new FileWriter(a+"/"+currentTime()+"-"+name+".html");
			fileWriter.write(data);
			fileWriter.flush();
			fileWriter.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
	}
	public static LinkedList<String> perProcessUsageMap(){
		LinkedList<String> map=new LinkedList<String>();
		String processes=executeCommand(cpuUsageCmd);
		String[] str=processes.split("\n");
		for(int i=4;i<str.length;i++) {
			String temp[]=str[i].split("\\s+");
			if(temp.length==3)
				map.add(temp[0]+"~"+temp[1]);
			else
				map.add(temp[0]+"~"+temp[2]);
		}
		return map;
	}
	public static void main(String[] args) {
		System.out.println(cpuLoad());
	}
	
	
}
