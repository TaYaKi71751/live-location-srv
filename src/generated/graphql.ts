import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  addDevice?: Maybe<Array<Maybe<Device>>>;
  auth: User;
  deleteDevice?: Maybe<Array<Maybe<Device>>>;
  listDevice?: Maybe<Array<Maybe<Device>>>;
  register: User;
  updateLocation: DeviceSubscriptionAlert;
};


export type QueryAddDeviceArgs = {
  auth: AuthInput;
};


export type QueryAuthArgs = {
  auth: AuthInput;
};


export type QueryDeleteDeviceArgs = {
  auth: AuthInput;
  device: DeviceInput;
};


export type QueryListDeviceArgs = {
  auth: AuthInput;
};


export type QueryRegisterArgs = {
  auth: AuthInput;
};


export type QueryUpdateLocationArgs = {
  auth: AuthInput;
  device: DeviceInput;
  location: LocationInput;
};

export type AuthInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Device = {
  __typename?: 'Device';
  created_at?: Maybe<Scalars['ID']>;
  id?: Maybe<Scalars['ID']>;
  location?: Maybe<Location>;
  user?: Maybe<User>;
};

export type Location = {
  __typename?: 'Location';
  created_at?: Maybe<Scalars['ID']>;
  id?: Maybe<Scalars['ID']>;
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
};

export type User = {
  __typename?: 'User';
  created_at?: Maybe<Scalars['ID']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
};

export type DeviceInput = {
  id?: InputMaybe<Scalars['ID']>;
};

export type LocationInput = {
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export type DeviceSubscriptionAlert = {
  __typename?: 'DeviceSubscriptionAlert';
  device: Device;
  location: Location;
  user: User;
};

export type Subscription = {
  __typename?: 'Subscription';
  locationUpdated?: Maybe<DeviceSubscriptionAlert>;
};


export type SubscriptionLocationUpdatedArgs = {
  auth: AuthInput;
  device: DeviceInput;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  AuthInput: AuthInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  Device: ResolverTypeWrapper<Device>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Location: ResolverTypeWrapper<Location>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  User: ResolverTypeWrapper<User>;
  DeviceInput: DeviceInput;
  LocationInput: LocationInput;
  DeviceSubscriptionAlert: ResolverTypeWrapper<DeviceSubscriptionAlert>;
  Subscription: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  AuthInput: AuthInput;
  String: Scalars['String'];
  Device: Device;
  ID: Scalars['ID'];
  Location: Location;
  Float: Scalars['Float'];
  User: User;
  DeviceInput: DeviceInput;
  LocationInput: LocationInput;
  DeviceSubscriptionAlert: DeviceSubscriptionAlert;
  Subscription: {};
  Boolean: Scalars['Boolean'];
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  addDevice?: Resolver<Maybe<Array<Maybe<ResolversTypes['Device']>>>, ParentType, ContextType, RequireFields<QueryAddDeviceArgs, 'auth'>>;
  auth?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryAuthArgs, 'auth'>>;
  deleteDevice?: Resolver<Maybe<Array<Maybe<ResolversTypes['Device']>>>, ParentType, ContextType, RequireFields<QueryDeleteDeviceArgs, 'auth' | 'device'>>;
  listDevice?: Resolver<Maybe<Array<Maybe<ResolversTypes['Device']>>>, ParentType, ContextType, RequireFields<QueryListDeviceArgs, 'auth'>>;
  register?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryRegisterArgs, 'auth'>>;
  updateLocation?: Resolver<ResolversTypes['DeviceSubscriptionAlert'], ParentType, ContextType, RequireFields<QueryUpdateLocationArgs, 'auth' | 'device' | 'location'>>;
};

export type DeviceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Device'] = ResolversParentTypes['Device']> = {
  created_at?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = {
  created_at?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  created_at?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceSubscriptionAlertResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeviceSubscriptionAlert'] = ResolversParentTypes['DeviceSubscriptionAlert']> = {
  device?: Resolver<ResolversTypes['Device'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['Location'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  locationUpdated?: SubscriptionResolver<Maybe<ResolversTypes['DeviceSubscriptionAlert']>, "locationUpdated", ParentType, ContextType, RequireFields<SubscriptionLocationUpdatedArgs, 'auth' | 'device'>>;
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>;
  Device?: DeviceResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  DeviceSubscriptionAlert?: DeviceSubscriptionAlertResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};

