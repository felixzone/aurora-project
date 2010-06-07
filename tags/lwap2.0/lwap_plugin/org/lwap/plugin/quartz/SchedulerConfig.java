/*
 * Created on 2006-11-25
 */
package org.lwap.plugin.quartz;

import java.util.HashMap;
import java.util.logging.Logger;

import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.Trigger;

import uncertain.core.IGlobalInstance;
import uncertain.core.UncertainEngine;
import uncertain.ocm.IObjectRegistry;

public class SchedulerConfig implements IGlobalInstance {
    
    public static final String  KEY_UE ="UncertainEngine";
    
    UncertainEngine     uncertainEngine;
    SchedulerFactory    schedulerFactory;
    Scheduler           scheduler;

    JobDetail[]         jobs;
    Trigger[]           triggers;
    JobInstance[]       instances;

    HashMap             job_map = new HashMap(), trigger_map = new HashMap();
    Logger              logger;
    boolean             Debug = false;
    
    public SchedulerConfig(UncertainEngine  uncertainEngine)
    {
        this.uncertainEngine = uncertainEngine;
        logger = uncertainEngine.getLogger();
        schedulerFactory = new org.quartz.impl.StdSchedulerFactory();
    }
    
    
    public static UncertainEngine getUncertainEngine(JobDataMap m){
        return (UncertainEngine)m.get(KEY_UE);
    }
    
    public JobDetail[] getJobs(){
        return jobs;
    }
    
    public void setJobs(JobDetail[] jobs){
        this.jobs = jobs;
        for(int i=0; i<jobs.length; i++){
            JobDetail job = jobs[i];
            if(job.getGroup()==null) job.setGroup(Scheduler.DEFAULT_GROUP);
            JobDataMap m = job.getJobDataMap();
            m.put(KEY_UE, uncertainEngine);
            job_map.put(job.getName(), job);
            if(Debug)
                logger.info("Added job "+job.toString());
        }
    }    
    
    /**
     * @return the tiggers
     */
    public Trigger[] getTriggers() {
        return triggers;
    }

    /**
     * @param tiggers the tiggers to set
     */
    public void setTriggers(Trigger[] t) {
        this.triggers = t;
        for(int i=0; i<triggers.length; i++){
            Trigger trigger = triggers[i];
            if(trigger.getGroup()==null) trigger.setGroup(Scheduler.DEFAULT_GROUP);
            trigger_map.put(trigger.getName(), trigger);
            if(Debug)
                logger.info("Added trigger "+trigger.toString());
        }
    }

    /**
     * @return the instances
     */
    public JobInstance[] getInstances() {
        return instances;
    }
    
    public JobDetail getJobDetail(String name){
        return (JobDetail)job_map.get(name);
    }
    
    public Trigger getTrigger(String name){
        return (Trigger)trigger_map.get(name);
    }

    /**
     * @param instances the instances to set
     */
    public void setInstances(JobInstance[] instances) {
        this.instances = instances;
    }    
    
    public void onInitialize() throws Exception {
        IObjectRegistry os = uncertainEngine.getObjectRegistry();
        try{
            scheduler = schedulerFactory.getScheduler();
        }catch(Throwable er){
            er.printStackTrace();
        }
        os.registerInstance(SchedulerFactory.class, schedulerFactory);
        os.registerInstance(Scheduler.class, scheduler);
        int count=0;
        for(count=0; count<instances.length; count++){
            JobInstance ji = instances[count];
            JobDetail job = getJobDetail(ji.getJobName());
            if(job == null) logger.warning("Job '"+ji.getJobName()+"' is not defined");
            Trigger trigger = getTrigger(ji.getTriggerName());
            if(trigger == null) logger.warning("Trigger '"+ji.getTriggerName()+"' is not defined");
            try{
                scheduler.scheduleJob(job, trigger);
            }catch(Throwable ex){
                ex.printStackTrace();
            }
        }
        if(count==0)
            logger.warning("No job instances defined");
        else{
            scheduler.start();
            logger.info("Quartz scheduler started,"+count+" jobs running");
        }
    }
    
    public void onShutdown() throws SchedulerException {
        //System.out.println("Quartz scheduler shutdown");
        logger.info("Quartz scheduler shutdown");
        scheduler.shutdown();
    }


}
