package com.bpm;

import java.text.ParseException;

import org.quartz.CronExpression;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

public class Runner {

	public static void main(String[] args) {
		ConfigFactory.launchFactory();
		Scheduler scheduler=null;
		try {
			scheduler=new StdSchedulerFactory().getScheduler();
			scheduler.start();
			scheduler.scheduleJob(jobDetail(), triggerer());
			if(ConfigFactory.config().sendReportOnSOS) {
				scheduler.scheduleJob(JobBuilder.newJob(StatusReport.class).build(), startTimeTrigger());
			}
			if(ConfigFactory.config().sendReportOnEOS) {
				scheduler.scheduleJob(JobBuilder.newJob(StatusReport.class).build(), endTimeTrigger());
			}
		} catch (SchedulerException e) {
			e.printStackTrace();
			try {
				scheduler.shutdown();
			} catch (SchedulerException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
	}
	
	private static JobDetail jobDetail() {
		return JobBuilder.newJob(HealthAnalyzer.class)
				.withIdentity("BPM-SYS-ANALYZER").build();
	}
	private static Trigger triggerer(){
		Trigger trigger=null;
		try {
			trigger= TriggerBuilder.newTrigger().
			withSchedule(CronScheduleBuilder.cronSchedule(new CronExpression(ConfigFactory.config().triggerFrequency))).build();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return trigger;
	}
	private static Trigger startTimeTrigger(){
		Trigger trigger=null;
		try {
			trigger= TriggerBuilder.newTrigger().
			withSchedule(CronScheduleBuilder.cronSchedule(new CronExpression(ConfigFactory.config().startTime))).build();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return trigger;
	}
	private static Trigger endTimeTrigger(){
		Trigger trigger=null;
		try {
			trigger= TriggerBuilder.newTrigger().
			withSchedule(CronScheduleBuilder.cronSchedule(new CronExpression(ConfigFactory.config().endTime))).build();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return trigger;
	}

}
