import { Button, Container, CssBaseline, Divider, Link, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import Check from './Check';
import FillSheet from './FillSheet';
// 返回顶部

import { useEffect } from 'react';

const useStyles = makeStyles((theme:any) => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
    
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ['填写商品信息', '验证商家身份', '最终确认'];



export default function Launch() {
  const [CampaignId, setCampaignId] = useState(0);
  const [beneficiaryCheck, setBeneficiaryCheck] = React.useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [rootFormData, setRootFormData] = useState({
    id: 0,
    title: "",
    details: "",
    description: "",
    target: 0,
    current: 0,
    createdAt: new Date(),
    deadline: new Date(),
    beneficiary: "",
    launcher: "",
    status: ""
  });


  function getStepContent(step:any) {
  
    switch (step) {
      case 0:
        return <FillSheet onHandleAddress={setRootFormData} rootFormData={rootFormData}  setState={setBeneficiaryCheck}/>;
      case 1:
        return <Check beneficiary={rootFormData.beneficiary} setState={setBeneficiaryCheck} />;
      case 2:
      default:
        throw new Error('Unknown step');
    }
  }

  

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = ( )=> {
    if(activeStep < 2){
      let newStep = activeStep + 1;
      setActiveStep(newStep);
      return;
    }else{
    }
  };

  const handleBack = () => {
    let newStep = activeStep - 1;
    setActiveStep(newStep);
  };

  return (
    <>
      <Container
            maxWidth="lg"
            component="main"
            sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
          >
        <div>
          <Typography variant="h2" gutterBottom>
            New <b style={{color:"#ff914d"}}>PriceScout</b> Commodity
            <br /> | 发布商品
          </Typography>
          <Divider />
          <Typography>Fill the Sheet Below Now!
          <br />填写表格，上架你的商品！
          </Typography>
        </div>
        <Container sx={{ py: 2 }} maxWidth="md">
          <CssBaseline />
          <main className={classes.layout}>
            <Paper className={classes.paper}>
              <Typography component="h1" variant="h4" align="center">
                发布商品
              </Typography>
              <Stepper activeStep={activeStep} className={classes.stepper}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <React.Fragment>
                {activeStep === steps.length ? (
                  <React.Fragment>
                    <Typography variant="h5" gutterBottom>
                      感谢你为善心出力！
                    </Typography>
                    <Typography variant="subtitle1">
                      你的商品已经成功提交，但需要第三方公证后才可以正式发布并被查看。
                      若已是第三方，请点击<Link href={"/third-party"}>这里</Link>进行审核。
                      目前状态为刚发起，等待审核中。
                      你的商品ID是：{CampaignId}，可以点击<Link href={"root/details/:"+CampaignId}>这里</Link>查看。
                    </Typography>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {getStepContent(activeStep)}
                    <div className={classes.buttons}>
                      {activeStep !== 0 && (
                        <Button onClick={handleBack} className={classes.button}>
                          上一步
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleNext}
                        className={classes.button}
                        disabled={(activeStep === 0 && rootFormData.beneficiary.length === 0 )||(activeStep ===1 && beneficiaryCheck === false)}
                          // ||(activeStep ===1 && beneficiaryCheck === false)}
                      >
                        {activeStep === steps.length - 1 ? '确认申请' : '下一步'}
                      </Button>
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            </Paper>
          </main>
        </Container>
          
      </Container>
    </>
  );
}
