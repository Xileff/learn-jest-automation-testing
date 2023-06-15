const Rocket = require('./Rocket');
const RocketLauncher = require('./RocketLauncher');
const RocketRepairKit = require('./RocketRepairKit');

describe('A RocketLauncher', () => {
  // 1. Dummy : Fill mandatory parameter with dummy objects
  it('should launch all rockets', () => {
    // Arrange
    const nasaRocket = new Rocket('Nasa');
    const spaceXRocket = new Rocket('SpaceX');

    const rocketLauncher = new RocketLauncher({}, [nasaRocket, spaceXRocket]);

    // Action
    rocketLauncher.launchAllRockets();

    // Assert
    expect(nasaRocket.engineStatus).toEqual('active');
    expect(spaceXRocket.engineStatus).toEqual('active');
    expect(rocketLauncher.rockets.length).toEqual(0);
  });

  it('should launch only one rocket by queue', () => {
    // Arrange
    const nasaRocket = new Rocket('Nasa');
    const spaceXRocket = new Rocket('SpaceX');
    const rocketLauncher = new RocketLauncher({}, [nasaRocket, spaceXRocket]);

    // Action
    rocketLauncher.launchRocketByQueue();

    // Assert
    expect(nasaRocket.engineStatus).toEqual('active');
    expect(spaceXRocket.engineStatus).toEqual('inactive');
    expect(rocketLauncher.rockets.length).toEqual(1);
  });

  // 2. Stub : Create a fake object with certain behavior to fulfill the testing scenario
  it('should return correct result when repair kit cannot repair the rocket', async () => {
    // Arrange
    const fakeRocketRepairKit = {
      repair: () => Promise.reject('failed to repair the rocket'),
    };

    const rocketLauncher = new RocketLauncher(fakeRocketRepairKit, [{}]);

    // Action
    const result = await rocketLauncher.repairAllRockets();

    // Assert
    expect(result).toEqual('there was 1 of 1 rocket fail to repair!');
  });

  // 3. Mock : Change a fake object with certain behavior to verify a function is called
  it('should repair some repairable rocket when repair kit cannot repair some of the rocket', async () => {
    // Arrange
    const repairableRocket = new Rocket('repairableRocket');
    const unrepairableRocket = new Rocket('unrepairableRocket');

    const fakeRocketRepairKit = {
      repair: jest.fn().mockImplementation((rocket) => {
        if (rocket.name === 'repairableRocket') {
          return Promise.resolve();
        }

        return Promise.reject('failed to repair the rocket');
      }),
    };

    const rocketLauncher = new RocketLauncher(
      fakeRocketRepairKit,
      [repairableRocket, unrepairableRocket],
    );

    // Action
    const result = await rocketLauncher.repairAllRockets();

    // Assert
    expect(result).toEqual('there was 1 of 2 rocket fail to repair!');
    expect(fakeRocketRepairKit.repair).toBeCalled();
    expect(fakeRocketRepairKit.repair).toBeCalledWith(repairableRocket);
  });

  // 4. Spy : Create a real object to fulfill real scenario
  it('should repair all the rockets with repair kit correctly', async () => {
    // Arrange -> real object
    const nasaRocket = new Rocket('Nasa');
    const spaceXRocket = new Rocket('SpaceX');
    const rocketRepairKit = new RocketRepairKit({}, {}, {});

    const spyRepair = jest.spyOn(rocketRepairKit, 'repair');
    const rocketLauncher = new RocketLauncher(rocketRepairKit, [nasaRocket, spaceXRocket]);

    // Action
    const result = await rocketLauncher.repairAllRockets();

    // Assert
    expect(spyRepair).toBeCalledTimes(2);
    expect(spyRepair).toBeCalledWith(nasaRocket);
    expect(spyRepair).toBeCalledWith(spaceXRocket);
    expect(result).toEqual('all rocket repaired!');
  });
});

/* Key takeaway :
When possible, implement "spy"
Don't "mock" everything, just do it when it's troublesome to create a real object for testing
*/
