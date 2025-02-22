import { PrismaClient, Permission, Role, User } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  const users = await createUsers();
  const permissions = await createPermissions();
  const roles = await createRoles();
  await connectRoleToPermissions(roles[0], permissions);
  await connectRoleToPermissions(
    roles[1],
    permissions.filter(
      (permission) =>
        permission.name.indexOf(':list') !== -1 ||
        permission.name.indexOf(':read') !== -1,
    ),
  );
  await connectUserToRoles(users[0], [roles[0]]);
  await connectUserToRoles(users[1], [roles[1]]);
  await prisma.$disconnect();
}

async function connectUserToRoles(user: User, roles: Role[]) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      roles: {
        connect: roles.map((role) => ({ id: role.id })),
      },
    },
  });
}

async function connectRoleToPermissions(role: Role, permissions: Permission[]) {
  return prisma.role.update({
    where: { id: role.id },
    data: {
      permissions: {
        connect: permissions.map((permission) => ({ id: permission.id })),
      },
    },
  });
}

async function createPermissions() {
  const sections = ['users', 'roles', 'permissions'];
  const methods = ['list', 'create', 'read', 'update', 'delete'];
  const permissions: { name: string; description: string }[] = [];
  for (const section of sections) {
    for (const method of methods) {
      permissions.push({
        name: `${section}:${method}`,
        description: `${method} ${section}`,
      });
    }
    if (section === 'users') {
      permissions.push({
        name: 'users:roles',
        description: 'roles users',
      });
    }
    if (section === 'roles') {
      permissions.push({
        name: 'roles:permissions',
        description: 'permissions roles',
      });
    }
  }
  return prisma.permission.createManyAndReturn({ data: permissions });
}

async function createRoles() {
  const roles = [
    { name: 'Supervisor', description: 'Supervisor role' },
    { name: 'Default', description: 'default role' },
  ];
  return prisma.role.createManyAndReturn({ data: roles });
}

function createUsers() {
  const users = [
    {
      name: 'John Doe',
      email: 'john.doe@domain.com',
      password: hashSync('example', 10),
      isActive: true,
      isAdmin: false,
    },
    {
      name: 'Jane Doe',
      email: 'jane.doe@domain.com',
      password: hashSync('example', 10),
      isActive: true,
      isAdmin: false,
    },
    {
      name: 'Bob Doe',
      email: 'bob.doe@domain.com',
      password: hashSync('example', 10),
      isActive: true,
      isAdmin: true,
    },
  ];
  return prisma.user.createManyAndReturn({ data: users });
}

seed().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
