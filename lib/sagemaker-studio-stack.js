const { Stack, Duration } = require('aws-cdk-lib');
const { CfnDomain, CfnUserProfile, CfnApp } = require('aws-cdk-lib/aws-sagemaker');
const { Role, ServicePrincipal, ManagedPolicy } = require('aws-cdk-lib/aws-iam');
const { SubnetType } = require('aws-cdk-lib/aws-ec2');
const { App } = require('aws-cdk-lib');
const { aws_ec2 } = require('aws-cdk-lib');


class SagemakerStudioStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const identifier = props.env.identifier || 'example';
    const region = props.env.region || 'us-east-1';

    // Create sagemaker execution role
    let sagemakerExecutionRole = new Role(this, 'SageMakerExecutionRole', {
      assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      roleName: `SageMakerExecutionRole-${identifier}-${region}`,
    });
    sagemakerExecutionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess')
    );

    const userSettings = {
      executionRole: sagemakerExecutionRole.roleArn,
    };

    const defaultVpc = aws_ec2.Vpc.fromLookup(this, 'ImportVPC',{isDefault: true});
    const vpcSubnets = defaultVpc.selectSubnets({ subnetType: SubnetType.PUBLIC });
    const sagemakerDomain = new CfnDomain(this, `SagemakerDomain-${identifier}`, {
      authMode: 'IAM',
      defaultUserSettings: userSettings,
      domainName: `sagemaker-domain-${identifier}`,
      subnetIds: vpcSubnets.subnetIds,
      vpcId: defaultVpc.vpcId,
    });


    const profile = {'team': 'data-science-team', 'name': 'johndoe'}
    const userProfile = new CfnUserProfile(this, `Team-${profile.team}-User-${profile.name}`, {
      domainId: sagemakerDomain.attrDomainId,
      userProfileName: `User-${profile.name}`,
      userSettings: userSettings,
    });
    const defaultApp = new CfnApp(this, `User-${profile.name}-App-default`, {
      appName: 'default',
      appType: 'JupyterServer',
      domainId: sagemakerDomain.attrDomainId,
      userProfileName: userProfile.userProfileName
    });
  }
}

module.exports = { SagemakerStudioStack }
