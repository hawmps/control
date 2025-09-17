import { db, items, securityControls, controlImplementations, subControls } from './index';

const seedData = async () => {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.delete(controlImplementations);
  await db.delete(subControls);
  await db.delete(items);
  await db.delete(securityControls);

  // Insert items
  const insertedItems = await db.insert(items).values([
    {
      name: 'Customer Portal Web Application',
      description: 'Public-facing web application for customer self-service',
      category: 'Web Application',
      item_type: 'Application',
      owner: 'Engineering Team',
      criticality: 'high',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      name: 'Payment Processing System',
      description: 'Core payment processing infrastructure',
      category: 'Financial System',
      item_type: 'System',
      owner: 'Finance Team',
      criticality: 'critical',
      created_at: '2024-01-16T14:20:00Z',
      updated_at: '2024-01-16T14:20:00Z'
    },
    {
      name: 'Employee Database',
      description: 'Internal HR database containing employee records',
      category: 'Database',
      item_type: 'Database',
      owner: 'HR Team',
      criticality: 'high',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z'
    },
    {
      name: 'Marketing Website',
      description: 'Public marketing and company information website',
      category: 'Web Application',
      item_type: 'Application',
      owner: 'Marketing Team',
      criticality: 'medium',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-12T16:45:00Z'
    }
  ]).returning();

  // Insert security controls
  const insertedControls = await db.insert(securityControls).values([
    {
      name: 'Access Control',
      description: 'User authentication and authorization',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Data Encryption',
      description: 'Encryption of sensitive data',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Vulnerability Management',
      description: 'Regular vulnerability scanning and patching',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Audit Logging',
      description: 'System and user activity logging',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Backup and Recovery',
      description: 'Data backup and disaster recovery',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]).returning();

  // Insert sub-controls
  const subControlsData = [];
  const now = '2024-01-01T00:00:00Z';

  // Access Control sub-controls
  const accessControlId = insertedControls.find(c => c.name === 'Access Control')?.id;
  if (accessControlId) {
    subControlsData.push(
      {
        control_id: accessControlId,
        name: 'Multi-Factor Authentication',
        description: 'Require multiple forms of authentication for access',
        created_at: now,
        updated_at: now
      },
      {
        control_id: accessControlId,
        name: 'Role-Based Access Control',
        description: 'Assign permissions based on user roles and responsibilities',
        created_at: now,
        updated_at: now
      },
      {
        control_id: accessControlId,
        name: 'Privileged Access Management',
        description: 'Control and monitor access to privileged accounts',
        created_at: now,
        updated_at: now
      }
    );
  }

  // Data Encryption sub-controls
  const dataEncryptionId = insertedControls.find(c => c.name === 'Data Encryption')?.id;
  if (dataEncryptionId) {
    subControlsData.push(
      {
        control_id: dataEncryptionId,
        name: 'Data at Rest Encryption',
        description: 'Encrypt sensitive data stored in databases and files',
        created_at: now,
        updated_at: now
      },
      {
        control_id: dataEncryptionId,
        name: 'Data in Transit Encryption',
        description: 'Encrypt data being transmitted over networks',
        created_at: now,
        updated_at: now
      },
      {
        control_id: dataEncryptionId,
        name: 'Key Management',
        description: 'Secure generation, storage, and rotation of encryption keys',
        created_at: now,
        updated_at: now
      }
    );
  }

  // Vulnerability Management sub-controls
  const vulnMgmtId = insertedControls.find(c => c.name === 'Vulnerability Management')?.id;
  if (vulnMgmtId) {
    subControlsData.push(
      {
        control_id: vulnMgmtId,
        name: 'Vulnerability Scanning',
        description: 'Regular automated scanning for security vulnerabilities',
        created_at: now,
        updated_at: now
      },
      {
        control_id: vulnMgmtId,
        name: 'Patch Management',
        description: 'Timely application of security patches and updates',
        created_at: now,
        updated_at: now
      },
      {
        control_id: vulnMgmtId,
        name: 'Penetration Testing',
        description: 'Regular security testing by authorized personnel',
        created_at: now,
        updated_at: now
      }
    );
  }

  // Audit Logging sub-controls
  const auditLoggingId = insertedControls.find(c => c.name === 'Audit Logging')?.id;
  if (auditLoggingId) {
    subControlsData.push(
      {
        control_id: auditLoggingId,
        name: 'Security Event Logging',
        description: 'Log all security-relevant events and activities',
        created_at: now,
        updated_at: now
      },
      {
        control_id: auditLoggingId,
        name: 'Log Monitoring',
        description: 'Real-time monitoring and analysis of security logs',
        created_at: now,
        updated_at: now
      },
      {
        control_id: auditLoggingId,
        name: 'Log Retention',
        description: 'Secure long-term storage of audit logs',
        created_at: now,
        updated_at: now
      }
    );
  }

  // Backup and Recovery sub-controls
  const backupRecoveryId = insertedControls.find(c => c.name === 'Backup and Recovery')?.id;
  if (backupRecoveryId) {
    subControlsData.push(
      {
        control_id: backupRecoveryId,
        name: 'Data Backup',
        description: 'Regular automated backup of critical data',
        created_at: now,
        updated_at: now
      },
      {
        control_id: backupRecoveryId,
        name: 'Disaster Recovery',
        description: 'Procedures for recovering from major incidents',
        created_at: now,
        updated_at: now
      },
      {
        control_id: backupRecoveryId,
        name: 'Recovery Testing',
        description: 'Regular testing of backup and recovery procedures',
        created_at: now,
        updated_at: now
      }
    );
  }

  if (subControlsData.length > 0) {
    await db.insert(subControls).values(subControlsData);
  }

  // Insert control implementations using actual returned IDs
  const implementationsData = [];
  
  // Define the implementation data for each item-control combination
  const itemControlData = [
    // Customer Portal Web Application
    {
      item: insertedItems[0],
      implementations: [
        { controlName: 'Access Control', status: 'green', notes: 'Multi-factor authentication implemented' },
        { controlName: 'Data Encryption', status: 'green', notes: 'TLS 1.3 and AES-256 encryption in place' },
        { controlName: 'Vulnerability Management', status: 'yellow', notes: 'Weekly scans running, CI/CD integration in progress' },
        { controlName: 'Audit Logging', status: 'green', notes: 'Comprehensive audit logging implemented' },
        { controlName: 'Backup and Recovery', status: 'yellow', notes: 'Daily backups configured, testing recovery procedures' }
      ]
    },
    // Payment Processing System
    {
      item: insertedItems[1],
      implementations: [
        { controlName: 'Access Control', status: 'green', notes: 'Hardware security modules and biometric auth' },
        { controlName: 'Data Encryption', status: 'green', notes: 'PCI DSS compliant encryption and tokenization' },
        { controlName: 'Vulnerability Management', status: 'green', notes: 'Automated vulnerability scanning with immediate alerts' },
        { controlName: 'Audit Logging', status: 'green', notes: 'Tamper-evident transaction logging' },
        { controlName: 'Backup and Recovery', status: 'green', notes: 'Real-time replication and tested disaster recovery' }
      ]
    },
    // Employee Database
    {
      item: insertedItems[2],
      implementations: [
        { controlName: 'Access Control', status: 'green', notes: 'Active Directory integration with role-based access' },
        { controlName: 'Data Encryption', status: 'yellow', notes: 'Database encryption enabled, reviewing key management' },
        { controlName: 'Vulnerability Management', status: 'yellow', notes: 'Monthly scans scheduled, working on patch automation' },
        { controlName: 'Audit Logging', status: 'green', notes: 'All HR database access logged and monitored' },
        { controlName: 'Backup and Recovery', status: 'red', notes: 'Backup infrastructure pending budget approval' }
      ]
    },
    // Marketing Website
    {
      item: insertedItems[3],
      implementations: [
        { controlName: 'Access Control', status: 'yellow', notes: 'Basic authentication, planning MFA implementation' },
        { controlName: 'Data Encryption', status: 'green', notes: 'HTTPS enabled, no sensitive data collected' },
        { controlName: 'Vulnerability Management', status: 'yellow', notes: 'Monthly scans running, working on automated patching' },
        { controlName: 'Audit Logging', status: 'yellow', notes: 'Basic web server logs, enhancing monitoring' },
        { controlName: 'Backup and Recovery', status: 'green', notes: 'Static site with automated daily backups' }
      ]
    }
  ];

  // Create implementation records by matching control names to actual IDs
  for (const itemData of itemControlData) {
    for (const implData of itemData.implementations) {
      const control = insertedControls.find(c => c.name === implData.controlName);
      if (control) {
        implementationsData.push({
          item_id: itemData.item.id,
          control_id: control.id,
          status: implData.status,
          notes: implData.notes,
          created_at: itemData.item.created_at,
          updated_at: itemData.item.updated_at
        });
      }
    }
  }

  await db.insert(controlImplementations).values(implementationsData);

  console.log('✅ Database seeded successfully!');
  console.log(`- Inserted ${insertedItems.length} items`);
  console.log(`- Inserted ${insertedControls.length} security controls`);
  console.log(`- Inserted ${subControlsData.length} sub-controls`);
  console.log(`- Inserted ${implementationsData.length} control implementations`);
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().then(() => process.exit(0)).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

export default seedData;